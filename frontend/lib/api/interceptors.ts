'use client'

import { UnauthorizedError } from './errors'
import { httpClient } from './http'

// Request interceptor - attach token
export function setupRequestInterceptor() {
  // Token attachment is handled in httpClient.request()
  // This is a placeholder for additional request interceptors if needed
}

// Response interceptor - handle 401 and redirect
export function setupResponseInterceptor() {
  // This will be called from error handlers
}

export async function handle401Error() {
  // Clear auth state
  if (typeof window !== 'undefined') {
    const { useAuthStore } = await import('@/store/authStore')
    useAuthStore.getState().logout()

    // Redirect to login
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push('/login')
  }
}

// Global error handler wrapper
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      await handle401Error()
      throw error
    }
    throw error
  }
}

