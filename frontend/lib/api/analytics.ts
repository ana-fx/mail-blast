'use client'

import api from '@/lib/axios'

export interface AnalyticsOverview {
  total_sent: number
  total_delivered: number
  total_bounced: number
  total_opened: number
  total_clicked: number
  total_failed: number
  delivery_rate: number
  open_rate: number
  click_rate: number
  bounce_rate: number
}

export interface TimelineData {
  date: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounces: number
}

export interface TopLink {
  url: string
  click_count: number
  last_clicked: string
}

export interface EmailEvent {
  id: string
  message_id: string
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounce' | 'complaint'
  email_id?: string
  campaign_name?: string
  recipient_email?: string
  created_at: string
  meta?: Record<string, any>
}

export interface EventDetails {
  message_id: string
  subject?: string
  to?: string
  from?: string
  status?: string
  events: EmailEvent[]
  campaign?: {
    id: string
    title: string
  }
}

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await api.get<AnalyticsOverview>('/analytics/overview')
    return response.data
  },
  getTimeline: async (range: '7d' | '30d' | '90d' = '30d'): Promise<TimelineData[]> => {
    const response = await api.get<TimelineData[]>(`/analytics/timeline?range=${range}`)
    return response.data
  },
  getTopLinks: async (limit: number = 10): Promise<TopLink[]> => {
    const response = await api.get<TopLink[]>(`/analytics/top-links?limit=${limit}`)
    return response.data
  },
  getRecentEvents: async (limit: number = 25): Promise<EmailEvent[]> => {
    const response = await api.get<EmailEvent[]>(`/analytics/events/recent?limit=${limit}`)
    return response.data
  },
  getEventsByMessageId: async (messageId: string): Promise<EventDetails> => {
    const response = await api.get<EventDetails>(`/analytics/events/${messageId}`)
    return response.data
  },
}
