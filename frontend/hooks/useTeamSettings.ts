'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi, TeamSettings } from '@/lib/api/settings'

export function useTeamSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['team-settings'],
    queryFn: () => settingsApi.getTeamSettings(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TeamSettings>) => settingsApi.updateTeamSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-settings'] })
    },
  })

  return {
    settings: data,
    isLoading,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}

