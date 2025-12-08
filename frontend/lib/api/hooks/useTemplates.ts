'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Template } from '../types'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await apiClient.templates.list()
      return response.data
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const response = await apiClient.templates.get(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useTemplateActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: Partial<Template>) => apiClient.templates.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Template> }) =>
      apiClient.templates.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.templates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

