'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { webhooksApi, CreateWebhookRequest, UpdateWebhookRequest } from '@/lib/api/webhooks'

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhooksApi.list(),
  })
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: ['webhook', id],
    queryFn: () => webhooksApi.get(id),
    enabled: !!id,
  })
}

export function useWebhookActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateWebhookRequest, options?: { onSuccess?: (data: any) => void }) => {
      return webhooksApi.create(data).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookRequest }, options?: { onSuccess?: (data: any) => void }) => {
      return webhooksApi.update(id, data).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      queryClient.invalidateQueries({ queryKey: ['webhook', variables.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string, options?: { onSuccess?: () => void }) => {
      return webhooksApi.delete(id).then(() => {
        options?.onSuccess?.()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })

  const testMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.test(id),
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    test: testMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testMutation.isPending,
    testResult: testMutation.data,
  }
}

