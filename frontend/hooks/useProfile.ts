'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi, type UpdateProfileRequest, type ChangePasswordRequest, type UserPreferences } from '@/lib/api/settings'
import { useAuthStore } from '@/store/authStore'

export function useProfile() {
  const { user } = useAuthStore()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => settingsApi.getProfile(),
    enabled: !!user,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => settingsApi.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile query
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => settingsApi.changePassword(data),
  })

  return {
    profile: data,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    changePassword: passwordMutation.mutate,
    isUpdating: updateMutation.isPending,
    isChangingPassword: passwordMutation.isPending,
  }
}

export function usePreferences() {
  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => settingsApi.getPreferences(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserPreferences>) => settingsApi.updatePreferences(data),
  })

  return {
    preferences: data,
    isLoading,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}

