'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi } from '@/lib/api/campaigns'

export function useCampaignSend(campaignId: string) {
  const queryClient = useQueryClient()

  const sendMutation = useMutation({
    mutationFn: (data: { send_at?: string }) => campaignsApi.send(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaign-stats', campaignId] })
    },
  })

  return {
    send: sendMutation.mutate,
    isSending: sendMutation.isPending,
    error: sendMutation.error,
  }
}

export function useCampaignStats(campaignId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: () => campaignsApi.getStats(campaignId),
    enabled: enabled && !!campaignId,
    refetchInterval: enabled ? 3000 : false, // Poll every 3 seconds
  })
}

