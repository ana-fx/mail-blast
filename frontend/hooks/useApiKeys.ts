'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi, CreateApiKeyRequest, CreateApiKeyResponse } from '@/lib/api/settings'

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => settingsApi.getApiKeys(),
  })
}

export function useApiKeyActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyRequest, options?: { onSuccess?: (data: CreateApiKeyResponse) => void }) => {
      return settingsApi.createApiKey(data).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  const regenerateMutation = useMutation({
    mutationFn: (id: string, options?: { onSuccess?: (data: CreateApiKeyResponse) => void }) => {
      return settingsApi.regenerateApiKey(id).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => settingsApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  return {
    create: createMutation.mutate,
    regenerate: regenerateMutation.mutate,
    revoke: revokeMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
