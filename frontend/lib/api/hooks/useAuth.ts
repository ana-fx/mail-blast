'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '../client'
import { useAuthStore } from '@/store/authStore'
import { handle401Error } from '../interceptors'
import type { LoginCredentials, AuthResponse } from '../types'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setUser, setToken, logout: storeLogout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.auth.login(credentials)
      return response.data
    },
    onSuccess: (data: AuthResponse) => {
      setToken(data.token)
      setUser(data.user)
      queryClient.setQueryData(['auth', 'me'], data.user)
      router.push('/dashboard')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.auth.logout()
    },
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      router.push('/login')
    },
  })

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.auth.refresh()
      return response.data
    },
    onSuccess: (data: AuthResponse) => {
      setToken(data.token)
      setUser(data.user)
    },
  })

  // Check if store has hydrated
  const hasHydrated = useAuthStore((state: any) => (state as any)._hasHydrated ?? true)
  const token = useAuthStore((state) => state.token)

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await apiClient.auth.me()
        return response.data
      } catch (error: any) {
        // Try to refresh token if 401
        if (error?.status === 401) {
          try {
            const currentToken = useAuthStore.getState().token
            if (currentToken) {
              const refreshResponse = await apiClient.auth.refresh()
              if (refreshResponse.data?.token) {
                setToken(refreshResponse.data.token)
                // Retry me query
                const retryResponse = await apiClient.auth.me()
                return retryResponse.data
              }
            }
          } catch (refreshError) {
            // Refresh failed, logout
            await handle401Error()
          }
        }
        // Don't logout on network errors during development/hot reload
        if (error?.status !== 401) {
          throw error
        }
        await handle401Error()
        throw error
      }
    },
    enabled: !!token && hasHydrated, // Only run if token exists and store has hydrated
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes (increased from 5 minutes)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false, // Don't auto-refetch
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  })

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refresh: refreshMutation.mutate,
    user: meQuery.data,
    isLoading: loginMutation.isPending || meQuery.isLoading,
    isLoggingOut: logoutMutation.isPending,
    error: loginMutation.error,
  }
}

