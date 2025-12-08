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

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await apiClient.auth.me()
        return response.data
      } catch (error) {
        await handle401Error()
        throw error
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

