'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Contact } from '../types'

export function useContacts(params?: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const response = await apiClient.contacts.list(params)
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await apiClient.contacts.get(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useContactActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: Partial<Contact>) => apiClient.contacts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      apiClient.contacts.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.contacts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const importMutation = useMutation({
    mutationFn: ({ file, mapping }: { file: File; mapping: Record<string, string> }) =>
      apiClient.contacts.import(file, mapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    import: importMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: importMutation.isPending,
  }
}

