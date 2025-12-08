'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { SystemSettings, TrackingSettings } from '../types'

export function useSystemSettings() {
  return useQuery({
    queryKey: ['settings', 'system'],
    queryFn: async () => {
      const response = await apiClient.settings.getSystem()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTrackingSettings() {
  return useQuery({
    queryKey: ['settings', 'tracking'],
    queryFn: async () => {
      const response = await apiClient.settings.getTracking()
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useSettingsActions() {
  const queryClient = useQueryClient()

  const updateSystemMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => apiClient.settings.updateSystem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'system'] })
    },
  })

  const updateTrackingMutation = useMutation({
    mutationFn: (data: Partial<TrackingSettings>) => apiClient.settings.updateTracking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'tracking'] })
    },
  })

  return {
    updateSystem: updateSystemMutation.mutate,
    updateTracking: updateTrackingMutation.mutate,
    isUpdatingSystem: updateSystemMutation.isPending,
    isUpdatingTracking: updateTrackingMutation.isPending,
  }
}

