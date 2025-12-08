'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Campaign, CreateCampaignRequest } from '../types'

export function useCampaigns(params?: { page?: number; status?: string }) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const response = await apiClient.campaigns.list(params)
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await apiClient.campaigns.get(id)
      return response.data
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useCampaignActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateCampaignRequest) => apiClient.campaigns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
      apiClient.campaigns.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.campaigns.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const sendMutation = useMutation({
    mutationFn: ({ id, send_at }: { id: string; send_at?: string }) =>
      apiClient.campaigns.send(id, { send_at }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    send: sendMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSending: sendMutation.isPending,
  }
}

export function useCampaignStats(id: string) {
  return useQuery({
    queryKey: ['campaign', id, 'stats'],
    queryFn: async () => {
      const response = await apiClient.campaigns.getStats(id)
      return response.data
    },
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds
  })
}

