'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { automationApi, AutomationFlow, FlowNode, FlowEdge } from '@/lib/api/automation'

export function useAutomationFlows() {
  return useQuery({
    queryKey: ['automation', 'flows'],
    queryFn: () => automationApi.listFlows(),
  })
}

export function useAutomationFlow(id: string) {
  return useQuery({
    queryKey: ['automation', 'flow', id],
    queryFn: () => automationApi.getFlow(id),
    enabled: !!id,
  })
}

export function useAutomationFlowActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: Partial<AutomationFlow>) => automationApi.createFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'flows'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AutomationFlow> }) =>
      automationApi.updateFlow(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'flow', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['automation', 'flows'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => automationApi.deleteFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'flows'] })
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => automationApi.publishFlow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'flow', id] })
      queryClient.invalidateQueries({ queryKey: ['automation', 'flows'] })
    },
  })

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => automationApi.unpublishFlow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['automation', 'flow', id] })
      queryClient.invalidateQueries({ queryKey: ['automation', 'flows'] })
    },
  })

  const validateMutation = useMutation({
    mutationFn: (id: string) => automationApi.validateFlow(id),
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    validate: validateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
    isValidating: validateMutation.isPending,
    validationResult: validateMutation.data,
  }
}

export function useAutomationExecutions(flowId: string) {
  return useQuery({
    queryKey: ['automation', 'executions', flowId],
    queryFn: () => automationApi.getExecutions(flowId),
    enabled: !!flowId,
    refetchInterval: 10000, // Poll every 10 seconds
  })
}

