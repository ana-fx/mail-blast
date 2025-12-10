'use client'

import { ApiError, NetworkError, TimeoutError, handleApiError } from './errors'
import type { ApiResponse } from './types'

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  skipAuth?: boolean
}

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY = 1000 // 1 second

class HttpClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async getToken(): Promise<string | null> {
    // Get token from auth store or localStorage
    if (typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/store/authStore')
      const token = useAuthStore.getState().token
      // Fallback to localStorage if token not in store
      if (!token) {
        const storedToken = localStorage.getItem('auth_token')
        if (storedToken) {
          useAuthStore.getState().setToken(storedToken)
          return storedToken
        }
      }
      return token || null
    }
    return null
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private abortControllers = new Map<string, AbortController>()

  private async fetchWithRetry(
    url: string,
    config: RequestConfig,
    retries: number
  ): Promise<Response> {
    // Cancel previous request if exists
    const requestKey = `${config.method || 'GET'}:${url}`
    const existingController = this.abortControllers.get(requestKey)
    if (existingController) {
      existingController.abort()
    }

    const controller = new AbortController()
    this.abortControllers.set(requestKey, controller)

    try {
      const timeoutId = setTimeout(
        () => controller.abort(),
        config.timeout || DEFAULT_TIMEOUT
      )

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      this.abortControllers.delete(requestKey)

      if (!response.ok) {
        // Don't retry on client errors (4xx) except 429
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw await this.handleErrorResponse(response)
        }

        // Retry on server errors (5xx) or rate limit (429)
        if (retries > 0 && (response.status >= 500 || response.status === 429)) {
          const retryAfter = response.headers.get('Retry-After')
          const delayMs = retryAfter
            ? parseInt(retryAfter) * 1000
            : config.retryDelay || DEFAULT_RETRY_DELAY

          await this.delay(delayMs)
          return this.fetchWithRetry(url, config, retries - 1)
        }

        throw await this.handleErrorResponse(response)
      }

      return response
    } catch (error) {
      this.abortControllers.delete(requestKey)

      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError()
        }
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new NetworkError()
        }
      }

      throw handleApiError(error)
    }
  }

  cancelRequest(url: string, method: string = 'GET') {
    const requestKey = `${method}:${url}`
    const controller = this.abortControllers.get(requestKey)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(requestKey)
    }
  }

  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorData: any = {}
    try {
      errorData = await response.json()
    } catch {
      // Response is not JSON
    }

    const message = errorData.message || response.statusText || 'Request failed'
    const code = errorData.code
    const errors = errorData.errors

    switch (response.status) {
      case 401:
        // Handle 401 in interceptor
        return new (await import('./errors')).UnauthorizedError(message)
      case 403:
        return new (await import('./errors')).ForbiddenError(message)
      case 404:
        return new (await import('./errors')).NotFoundError(message)
      case 422:
        return new (await import('./errors')).ValidationError(message, errors)
      case 429:
        const retryAfter = response.headers.get('Retry-After')
        return new (await import('./errors')).RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter) : undefined
        )
      default:
        return new ApiError(message, response.status, code, errors)
    }
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers = new Headers(this.defaultHeaders)

    // Attach auth token unless skipped
    if (!config.skipAuth) {
      const token = await this.getToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    // Merge custom headers
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value as string)
      })
    }

    const retries = config.retries ?? (config.method === 'GET' ? DEFAULT_RETRIES : 0)

    let response = await this.fetchWithRetry(url, {
      ...config,
      headers,
    }, retries)

    // Handle 401 - try to refresh token first (before consuming response)
    if (response.status === 401 && !config.skipAuth && !endpoint.includes('/users/refresh') && !endpoint.includes('/users/auth')) {
      try {
        const token = await this.getToken()
        if (token) {
          // Try to refresh token
          const refreshResponse = await this.fetchWithRetry(`${this.baseURL}/users/refresh`, {
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }),
            body: JSON.stringify({ token }),
          }, 0)

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            const { useAuthStore } = await import('@/store/authStore')
            const newToken = refreshData.token || refreshData.data?.token
            if (newToken) {
              useAuthStore.getState().setToken(newToken)

              // Retry original request with new token
              headers.set('Authorization', `Bearer ${newToken}`)
              response = await this.fetchWithRetry(url, {
                ...config,
                headers,
              }, retries)
            }
          }
        }
      } catch (refreshError) {
        // Refresh failed, will be handled by error handler below
      }
    }

    // Check if still 401 after refresh attempt
    if (response.status === 401) {
      throw await this.handleErrorResponse(response)
    }

    const data = await response.json()
    return data
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()

