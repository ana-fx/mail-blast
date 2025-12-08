'use client'

import api from '@/lib/axios'

export interface Notification {
  id: string
  type: 'campaign' | 'email' | 'system' | 'team'
  category: string
  title: string
  description: string
  icon?: string
  read: boolean
  created_at: string
  metadata?: {
    campaign_id?: string
    user_id?: string
    link?: string
    [key: string]: any
  }
}

export interface ActivityLog {
  id: string
  actor: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  action: string
  target_type: string
  target_id?: string
  target_name?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
  total: number
}

export interface ActivityLogsResponse {
  logs: ActivityLog[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

export const notificationsApi = {
  list: async (params?: {
    type?: string
    read?: boolean
    page?: number
  }): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>('/notifications', { params })
    return response.data
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`)
  },
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all')
  },
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count')
    return response.data
  },
}

export const activityApi = {
  list: async (params?: {
    page?: number
    type?: string
    user?: string
    date_start?: string
    date_end?: string
  }): Promise<ActivityLogsResponse> => {
    const response = await api.get<ActivityLogsResponse>('/activity', { params })
    return response.data
  },
}

