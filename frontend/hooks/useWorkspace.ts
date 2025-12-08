'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi, type UpdateWorkspaceRequest } from '@/lib/api/settings'

export function useWorkspace() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['workspace'],
    queryFn: () => settingsApi.getWorkspace(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => settingsApi.updateWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })

  const testWebhookMutation = useMutation({
    mutationFn: () => settingsApi.testWebhook(),
  })

  return {
    workspace: data,
    isLoading,
    error,
    updateWorkspace: updateMutation.mutate,
    testWebhook: testWebhookMutation.mutate,
    isUpdating: updateMutation.isPending,
    isTestingWebhook: testWebhookMutation.isPending,
  }
}

