'use client'

import { httpClient } from './http'
import { trackingApi } from './tracking'
import type {
  ApiResponse,
  LoginCredentials,
  AuthResponse,
  Campaign,
  CreateCampaignRequest,
  Contact,
  Template,
  AnalyticsOverview,
  TimelinePoint,
  SystemSettings,
  TrackingSettings,
} from './types'

// Auth Endpoints
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return httpClient.post<AuthResponse>('/auth/login', credentials, { skipAuth: true })
  },
  logout: async (): Promise<void> => {
    await httpClient.post('/auth/logout')
  },
  refresh: async (): Promise<ApiResponse<AuthResponse>> => {
    return httpClient.post<AuthResponse>('/auth/refresh')
  },
  me: async (): Promise<ApiResponse<any>> => {
    return httpClient.get('/auth/me')
  },
}

// Campaign Endpoints
export const campaignsApi = {
  list: async (params?: { page?: number; status?: string }): Promise<ApiResponse<Campaign[]>> => {
    return httpClient.get<Campaign[]>('/campaigns', {
      // Convert params to query string would be handled by httpClient
    })
  },
  get: async (id: string): Promise<ApiResponse<Campaign>> => {
    return httpClient.get<Campaign>(`/campaigns/${id}`)
  },
  create: async (data: CreateCampaignRequest): Promise<ApiResponse<Campaign>> => {
    return httpClient.post<Campaign>('/campaigns', data)
  },
  update: async (id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
    return httpClient.put<Campaign>(`/campaigns/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/campaigns/${id}`)
  },
  send: async (id: string, data?: { send_at?: string }): Promise<ApiResponse<void>> => {
    return httpClient.post(`/campaigns/${id}/send`, data)
  },
  getStats: async (id: string): Promise<ApiResponse<any>> => {
    return httpClient.get(`/campaigns/${id}/stats`)
  },
}

// Contact Endpoints
export const contactsApi = {
  list: async (params?: { page?: number; search?: string; status?: string }): Promise<ApiResponse<Contact[]>> => {
    return httpClient.get<Contact[]>('/contacts', {})
  },
  get: async (id: string): Promise<ApiResponse<Contact>> => {
    return httpClient.get<Contact>(`/contacts/${id}`)
  },
  create: async (data: Partial<Contact>): Promise<ApiResponse<Contact>> => {
    return httpClient.post<Contact>('/contacts', data)
  },
  update: async (id: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> => {
    return httpClient.put<Contact>(`/contacts/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/contacts/${id}`)
  },
  import: async (file: File, mapping: Record<string, string>): Promise<ApiResponse<{ imported: number; failed: number }>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(mapping))
    return httpClient.post('/contacts/import', formData, {
      headers: {}, // Let browser set Content-Type for FormData
    })
  },
}

// Template Endpoints
export const templatesApi = {
  list: async (): Promise<ApiResponse<Template[]>> => {
    return httpClient.get<Template[]>('/templates')
  },
  get: async (id: string): Promise<ApiResponse<Template>> => {
    return httpClient.get<Template>(`/templates/${id}`)
  },
  create: async (data: Partial<Template>): Promise<ApiResponse<Template>> => {
    return httpClient.post<Template>('/templates', data)
  },
  update: async (id: string, data: Partial<Template>): Promise<ApiResponse<Template>> => {
    return httpClient.put<Template>(`/templates/${id}`, data)
  },
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/templates/${id}`)
  },
}

// Analytics Endpoints
export const analyticsApi = {
  overview: async (): Promise<ApiResponse<AnalyticsOverview>> => {
    return httpClient.get<AnalyticsOverview>('/analytics/overview')
  },
  timeline: async (range: '7d' | '30d' | '90d'): Promise<ApiResponse<TimelinePoint[]>> => {
    return httpClient.get<TimelinePoint[]>(`/analytics/timeline?range=${range}`)
  },
  topLinks: async (limit: number = 10): Promise<ApiResponse<any[]>> => {
    return httpClient.get<any[]>(`/analytics/top-links?limit=${limit}`)
  },
  recentEvents: async (limit: number = 25): Promise<ApiResponse<any[]>> => {
    return httpClient.get<any[]>(`/analytics/events/recent?limit=${limit}`)
  },
}

// Settings Endpoints
export const settingsApi = {
  getSystem: async (): Promise<ApiResponse<SystemSettings>> => {
    return httpClient.get<SystemSettings>('/settings/system')
  },
  updateSystem: async (data: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> => {
    return httpClient.put<SystemSettings>('/settings/system', data)
  },
  getTracking: async (): Promise<ApiResponse<TrackingSettings>> => {
    return httpClient.get<TrackingSettings>('/settings/tracking')
  },
  updateTracking: async (data: Partial<TrackingSettings>): Promise<ApiResponse<TrackingSettings>> => {
    return httpClient.put<TrackingSettings>('/settings/tracking', data)
  },
}

// Unified API Client
export const apiClient = {
  auth: authApi,
  campaigns: campaignsApi,
  contacts: contactsApi,
  templates: templatesApi,
  analytics: analyticsApi,
  settings: settingsApi,
  tracking: trackingApi,
}

export default apiClient

