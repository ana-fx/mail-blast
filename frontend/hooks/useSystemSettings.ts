'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi, SystemSettings, TrackingSettings } from '@/lib/api/settings'

export function useSystemSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingsApi.getSystemSettings(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>, options?: { onSuccess?: (data: any) => void }) => {
      return settingsApi.updateSystemSettings(data).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
    },
  })

  return {
    settings: data,
    isLoading,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}

export function useEmailStatus() {
  return useQuery({
    queryKey: ['email-status'],
    queryFn: () => settingsApi.getEmailStatus(),
  })
}

export function useTrackingSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tracking-settings'],
    queryFn: () => settingsApi.updateTrackingSettings({ open_tracking: true, click_tracking: true }),
  })

  const updateMutation = useMutation({
    mutationFn: (data: TrackingSettings, options?: { onSuccess?: (data: any) => void }) => {
      return settingsApi.updateTrackingSettings(data).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-settings'] })
    },
  })

  return {
    settings: data,
    isLoading,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}

