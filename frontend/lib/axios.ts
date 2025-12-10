'use client'

import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Add internal key header for internal routes
    if (config.url?.includes('/internal/')) {
      const internalKey = process.env.NEXT_PUBLIC_INTERNAL_KEY || ''
      if (internalKey) {
        config.headers['X-Internal-Key'] = internalKey
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 with token refresh attempt
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 - try to refresh token first (skip refresh endpoint itself)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/refresh') &&
      !originalRequest.url?.includes('/users/auth')
    ) {
      originalRequest._retry = true

      try {
        const token = useAuthStore.getState().token
        if (token) {
          // Try to refresh token using a separate axios instance to avoid interceptor loop
          const refreshAxios = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
            headers: { 'Content-Type': 'application/json' },
          })
          refreshAxios.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`
            return config
          })

          const refreshResponse = await refreshAxios.post('/users/refresh', { token })

          if (refreshResponse.data?.token) {
            useAuthStore.getState().setToken(refreshResponse.data.token)
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }

      // If refresh didn't work, logout
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api

