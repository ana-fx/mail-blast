'use client'

import api from '@/lib/axios'

export interface Campaign {
  id: string
  title: string
  subject: string
  content: string
  from_name: string
  from_email: string
  reply_to: string
  status: string
  created_at: string
  updated_at: string
  send_at?: string
}

export interface CampaignTemplate {
  version: number
  blocks: any[]
}

export const campaignsApi = {
  get: async (id: string): Promise<Campaign> => {
    const response = await api.get<Campaign>(`/campaigns/${id}`)
    return response.data
  },
  create: async (data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.post<Campaign>('/campaigns', data)
    return response.data
  },
  update: async (id: string, data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.put<Campaign>(`/campaigns/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`)
  },
  list: async (): Promise<Campaign[]> => {
    const response = await api.get<Campaign[]>('/campaigns')
    return response.data
  },
  schedule: async (id: string, data: { send_at: string }): Promise<Campaign> => {
    const response = await api.post<Campaign>(`/campaigns/${id}/schedule`, data)
    return response.data
  },
  sendTest: async (id: string, email: string): Promise<void> => {
    await api.post(`/campaigns/${id}/test`, { email })
  },
  getTemplate: async (id: string): Promise<CampaignTemplate> => {
    const response = await api.get<CampaignTemplate>(`/campaigns/${id}/template`)
    return response.data
  },
  saveTemplate: async (id: string, template: CampaignTemplate): Promise<void> => {
    await api.post(`/campaigns/${id}/template`, template)
  },
  renderTemplate: async (id: string, template: CampaignTemplate): Promise<{ html: string }> => {
    const response = await api.post<{ html: string }>(`/campaigns/${id}/render`, template)
    return response.data
  },
  getStats: async (id: string): Promise<CampaignStats> => {
    const response = await api.get<CampaignStats>(`/campaigns/${id}/stats`)
    return response.data
  },
  send: async (id: string, data: { send_at?: string }): Promise<void> => {
    await api.post(`/campaigns/${id}/send`, data)
  },
}

export interface CampaignStats {
  total_recipients: number
  queued: number
  sent: number
  failed: number
  progress_percentage: number
  status: 'draft' | 'queued' | 'processing' | 'sent' | 'failed'
}
