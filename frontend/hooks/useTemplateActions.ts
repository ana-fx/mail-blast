'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { templatesApi, CreateTemplateRequest, UpdateTemplateRequest } from '@/lib/api/templates'

export function useTemplateActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateTemplateRequest, options?: { onSuccess?: (data: any) => void }) => {
      return templatesApi.create(data).then((result) => {
        options?.onSuccess?.(result)
        return result
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      templatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      templatesApi.duplicate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    duplicate: duplicateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    error: createMutation.error || updateMutation.error || deleteMutation.error || duplicateMutation.error,
  }
}

