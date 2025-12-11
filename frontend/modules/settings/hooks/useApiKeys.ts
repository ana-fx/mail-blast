'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi, type CreateApiKeyRequest } from '@/lib/api/settings'

export function useApiKeys() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'api-keys'],
    queryFn: () => settingsApi.getApiKeys(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyRequest) => settingsApi.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
    },
  })

  return {
    apiKeys: data || [],
    isLoading,
    error,
    createApiKey: createMutation.mutate,
    deleteApiKey: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

