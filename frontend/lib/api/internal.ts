'use client'

import api from '@/lib/axios'

// Queue & Worker Monitor
export interface QueueStatus {
  name: string
  length: number
  active_workers: number
  concurrency: number
  uptime_seconds: number
  failed_jobs: FailedJob[]
}

export interface FailedJob {
  id: string
  queue: string
  payload: any
  error: string
  failed_at: string
  retry_count: number
}

// SMTP Stats
export interface SMTPStats {
  daily_usage: number
  daily_limit: number
  remaining: number
  per_hour_rate: number
  rejection_percentage: number
  bounce_rate: number
  ip_reputation?: number
  history_7d: Array<{ date: string; sent: number; rejected: number; bounced: number }>
  history_30d: Array<{ date: string; sent: number; rejected: number; bounced: number }>
}

// Server Health
export interface ServerHealth {
  cpu_usage_percent: number
  ram_usage_percent: number
  disk_usage_percent: number
  network_in_mbps: number
  network_out_mbps: number
  uptime_seconds: number
  node_logs: string[]
  nginx_logs?: string[]
}

// Error Logs
export interface ErrorLog {
  id: string
  type: 'api' | 'worker' | 'rate_limit' | 'smtp'
  level: 'error' | 'warn' | 'info'
  message: string
  stack_trace?: string
  metadata?: any
  created_at: string
}

// Internal Users
export interface InternalUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'developer' | 'support'
  created_at: string
  last_login?: string
  status: 'active' | 'banned'
}

export interface CreateInternalUserRequest {
  email: string
  name: string
  role: 'admin' | 'developer' | 'support'
}

// Feature Flags
export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  updated_at: string
}

// Task Scheduler
export interface ScheduledTask {
  id: string
  name: string
  schedule: string
  enabled: boolean
  last_run?: string
  last_result?: 'success' | 'failed'
  last_error?: string
  next_run?: string
}

// Audit Trail
export interface AuditLog {
  id: string
  user_id: string
  user_name: string
  action: string
  resource_type: string
  resource_id?: string
  changes?: {
    before: any
    after: any
  }
  created_at: string
}

export const internalApi = {
  // Queues
  getQueues: async (): Promise<QueueStatus[]> => {
    const response = await api.get<QueueStatus[]>('/internal/queues')
    return response.data
  },
  retryFailedJobs: async (queue?: string): Promise<void> => {
    await api.post('/internal/queues/retry', { queue })
  },
  clearQueue: async (queue?: string): Promise<void> => {
    await api.delete('/internal/queues/clear', { params: { queue } })
  },

  // SMTP Stats
  getSMTPStats: async (): Promise<SMTPStats> => {
    const response = await api.get<SMTPStats>('/internal/smtp-stats')
    return response.data
  },

  // Server Health
  getServerHealth: async (): Promise<ServerHealth> => {
    const response = await api.get<ServerHealth>('/internal/system/health')
    return response.data
  },

  // Error Logs
  getErrorLogs: async (params?: { type?: string; limit?: number }): Promise<ErrorLog[]> => {
    const response = await api.get<ErrorLog[]>('/internal/logs', { params })
    return response.data
  },
  deleteErrorLogs: async (type?: string): Promise<void> => {
    await api.delete('/internal/logs', { params: { type } })
  },
  downloadErrorLogs: async (type?: string): Promise<Blob> => {
    const response = await api.get('/internal/logs/download', {
      params: { type },
      responseType: 'blob',
    })
    return response.data
  },

  // Internal Users
  getInternalUsers: async (): Promise<InternalUser[]> => {
    const response = await api.get<InternalUser[]>('/internal/users')
    return response.data
  },
  createInternalUser: async (data: CreateInternalUserRequest): Promise<InternalUser> => {
    const response = await api.post<InternalUser>('/internal/users', data)
    return response.data
  },
  deleteInternalUser: async (id: string): Promise<void> => {
    await api.delete(`/internal/users/${id}`)
  },
  banInternalUser: async (id: string): Promise<void> => {
    await api.post(`/internal/users/${id}/ban`)
  },

  // Feature Flags
  getFeatureFlags: async (): Promise<FeatureFlag[]> => {
    const response = await api.get<FeatureFlag[]>('/internal/flags')
    return response.data
  },
  updateFeatureFlag: async (key: string, enabled: boolean): Promise<FeatureFlag> => {
    const response = await api.post<FeatureFlag>('/internal/flags/update', { key, enabled })
    return response.data
  },

  // Task Scheduler
  getScheduledTasks: async (): Promise<ScheduledTask[]> => {
    const response = await api.get<ScheduledTask[]>('/internal/scheduler')
    return response.data
  },
  runTaskNow: async (id: string): Promise<void> => {
    await api.post(`/internal/scheduler/run`, { task_id: id })
  },
  toggleTask: async (id: string, enabled: boolean): Promise<void> => {
    await api.post(`/internal/scheduler/toggle`, { task_id: id, enabled })
  },

  // Audit Trail
  getAuditTrail: async (params?: { limit?: number; user_id?: string }): Promise<AuditLog[]> => {
    const response = await api.get<AuditLog[]>('/internal/audit', { params })
    return response.data
  },

  // System Recovery
  rebuildIndex: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/internal/rebuild-index')
    return response.data
  },
  flushCache: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/internal/flush-cache')
    return response.data
  },
  fixCampaignStatus: async (campaignId?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/internal/fix-campaign-status', { campaign_id: campaignId })
    return response.data
  },
  forceStopWorker: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/internal/force-stop-worker')
    return response.data
  },
  recalculateAnalytics: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/internal/recalculate-analytics')
    return response.data
  },
}

