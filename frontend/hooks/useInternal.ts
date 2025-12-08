'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { internalApi } from '@/lib/api/internal'

// Queues
export function useQueues() {
  return useQuery({
    queryKey: ['internal', 'queues'],
    queryFn: () => internalApi.getQueues(),
    refetchInterval: 5000, // Poll every 5 seconds
  })
}

export function useQueueActions() {
  const queryClient = useQueryClient()

  const retryMutation = useMutation({
    mutationFn: (queue?: string) => internalApi.retryFailedJobs(queue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'queues'] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: (queue?: string) => internalApi.clearQueue(queue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'queues'] })
    },
  })

  return {
    retry: retryMutation.mutate,
    clear: clearMutation.mutate,
    isRetrying: retryMutation.isPending,
    isClearing: clearMutation.isPending,
  }
}

// SMTP Stats
export function useSMTPStats() {
  return useQuery({
    queryKey: ['internal', 'smtp-stats'],
    queryFn: () => internalApi.getSMTPStats(),
    refetchInterval: 60000, // Poll every minute
  })
}

// Server Health
export function useServerHealth() {
  return useQuery({
    queryKey: ['internal', 'server-health'],
    queryFn: () => internalApi.getServerHealth(),
    refetchInterval: 3000, // Poll every 3 seconds
  })
}

// Error Logs
export function useErrorLogs(type?: string) {
  return useQuery({
    queryKey: ['internal', 'error-logs', type],
    queryFn: () => internalApi.getErrorLogs({ type, limit: 100 }),
  })
}

export function useErrorLogActions() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (type?: string) => internalApi.deleteErrorLogs(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'error-logs'] })
    },
  })

  return {
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}

// Internal Users
export function useInternalUsers() {
  return useQuery({
    queryKey: ['internal', 'users'],
    queryFn: () => internalApi.getInternalUsers(),
  })
}

export function useInternalUserActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: any) => internalApi.createInternalUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => internalApi.deleteInternalUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'users'] })
    },
  })

  const banMutation = useMutation({
    mutationFn: (id: string) => internalApi.banInternalUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'users'] })
    },
  })

  return {
    create: createMutation.mutate,
    delete: deleteMutation.mutate,
    ban: banMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBanning: banMutation.isPending,
  }
}

// Feature Flags
export function useFeatureFlags() {
  return useQuery({
    queryKey: ['internal', 'feature-flags'],
    queryFn: () => internalApi.getFeatureFlags(),
  })
}

export function useFeatureFlagActions() {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      internalApi.updateFeatureFlag(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'feature-flags'] })
    },
  })

  return {
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}

// Task Scheduler
export function useScheduledTasks() {
  return useQuery({
    queryKey: ['internal', 'scheduler'],
    queryFn: () => internalApi.getScheduledTasks(),
    refetchInterval: 10000, // Poll every 10 seconds
  })
}

export function useTaskActions() {
  const queryClient = useQueryClient()

  const runMutation = useMutation({
    mutationFn: (id: string) => internalApi.runTaskNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'scheduler'] })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      internalApi.toggleTask(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal', 'scheduler'] })
    },
  })

  return {
    run: runMutation.mutate,
    toggle: toggleMutation.mutate,
    isRunning: runMutation.isPending,
    isToggling: toggleMutation.isPending,
  }
}

// Audit Trail
export function useAuditTrail(params?: { limit?: number; user_id?: string }) {
  return useQuery({
    queryKey: ['internal', 'audit', params],
    queryFn: () => internalApi.getAuditTrail(params),
  })
}

// System Recovery
export function useSystemRecovery() {
  const queryClient = useQueryClient()

  const rebuildIndexMutation = useMutation({
    mutationFn: () => internalApi.rebuildIndex(),
  })

  const flushCacheMutation = useMutation({
    mutationFn: () => internalApi.flushCache(),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const fixCampaignMutation = useMutation({
    mutationFn: (campaignId?: string) => internalApi.fixCampaignStatus(campaignId),
  })

  const stopWorkerMutation = useMutation({
    mutationFn: () => internalApi.forceStopWorker(),
  })

  const recalculateMutation = useMutation({
    mutationFn: () => internalApi.recalculateAnalytics(),
  })

  return {
    rebuildIndex: rebuildIndexMutation.mutate,
    flushCache: flushCacheMutation.mutate,
    fixCampaign: fixCampaignMutation.mutate,
    stopWorker: stopWorkerMutation.mutate,
    recalculate: recalculateMutation.mutate,
    isRebuilding: rebuildIndexMutation.isPending,
    isFlushing: flushCacheMutation.isPending,
    isFixing: fixCampaignMutation.isPending,
    isStopping: stopWorkerMutation.isPending,
    isRecalculating: recalculateMutation.isPending,
  }
}

