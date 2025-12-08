'use client'

import api from '@/lib/axios'

export interface Webhook {
  id: string
  url: string
  secret: string
  status: 'active' | 'inactive'
  event_types: string[]
  last_delivery_result?: {
    status: 'success' | 'failed' | 'retrying'
    status_code?: number
    error?: string
    delivered_at?: string
  }
  created_at: string
  updated_at: string
}

export interface CreateWebhookRequest {
  url: string
  event_types: string[]
  secret?: string
}

export interface UpdateWebhookRequest {
  url?: string
  event_types?: string[]
  status?: 'active' | 'inactive'
}

export interface TestWebhookResponse {
  success: boolean
  status_code?: number
  error?: string
  response_time_ms?: number
}

export const webhooksApi = {
  list: async (): Promise<Webhook[]> => {
    const response = await api.get<Webhook[]>('/webhooks')
    return response.data
  },
  get: async (id: string): Promise<Webhook> => {
    const response = await api.get<Webhook>(`/webhooks/${id}`)
    return response.data
  },
  create: async (data: CreateWebhookRequest): Promise<Webhook> => {
    const response = await api.post<Webhook>('/webhooks', data)
    return response.data
  },
  update: async (id: string, data: UpdateWebhookRequest): Promise<Webhook> => {
    const response = await api.put<Webhook>(`/webhooks/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/webhooks/${id}`)
  },
  test: async (id: string): Promise<TestWebhookResponse> => {
    const response = await api.post<TestWebhookResponse>(`/webhooks/${id}/test`)
    return response.data
  },
}

