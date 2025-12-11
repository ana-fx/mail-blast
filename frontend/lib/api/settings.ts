'use client'

import api from '@/lib/axios'

export interface SystemSettings {
  app_name: string
  default_from_email: string
  default_from_name: string
  reply_to_email: string
  timezone: string
  base_url: string
}

export interface EmailProviderStatus {
  provider: string
  region: string
  mode: 'sandbox' | 'production'
  verified_domains: string[]
  daily_sending_limit: number
  remaining_quota: number
}

export interface TrackingSettings {
  open_tracking: boolean
  click_tracking: boolean
  custom_tracking_domain?: string
}

export interface TeamSettings {
  organization_name: string
  industry?: string
  logo_url?: string
  branding_color?: string
}

export interface ApiKey {
  id: string
  name: string
  scopes: string[]
  created_at: string
  last_used_at?: string
  expires_at?: string
  status: 'active' | 'revoked'
  key_prefix?: string
}

export interface CreateApiKeyRequest {
  name: string
  scopes: string[]
  expires_in_days?: number
}

export interface CreateApiKeyResponse {
  id: string
  key: string
  name: string
  scopes: string[]
  expires_at?: string
}

export const settingsApi = {
  // System Settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await api.get<SystemSettings>('/settings/system')
    return response.data
  },
  updateSystemSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.put<SystemSettings>('/settings/system', data)
    return response.data
  },
  getEmailStatus: async (): Promise<EmailProviderStatus> => {
    const response = await api.get<EmailProviderStatus>('/settings/email-status')
    return response.data
  },
  updateTrackingSettings: async (data: TrackingSettings): Promise<TrackingSettings> => {
    const response = await api.put<TrackingSettings>('/settings/tracking', data)
    return response.data
  },
  // Team Settings
  getTeamSettings: async (): Promise<TeamSettings> => {
    const response = await api.get<TeamSettings>('/settings/team')
    return response.data
  },
  updateTeamSettings: async (data: Partial<TeamSettings>): Promise<TeamSettings> => {
    const response = await api.put<TeamSettings>('/settings/team', data)
    return response.data
  },
  // API Keys
  getApiKeys: async (): Promise<ApiKey[]> => {
    const response = await api.get<ApiKey[]>('/settings/api-keys')
    return response.data
  },
  createApiKey: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    const response = await api.post<CreateApiKeyResponse>('/settings/api-keys', data)
    return response.data
  },
  regenerateApiKey: async (id: string): Promise<CreateApiKeyResponse> => {
    const response = await api.post<CreateApiKeyResponse>(`/settings/api-keys/${id}/regenerate`)
    return response.data
  },
  revokeApiKey: async (id: string): Promise<void> => {
    await api.post(`/settings/api-keys/${id}/revoke`)
  },
  deleteApiKey: async (id: string): Promise<void> => {
    await api.delete(`/settings/api-keys/${id}`)
  },
  // Profile
  getProfile: async (): Promise<any> => {
    const response = await api.get('/settings/profile')
    return response.data
  },
  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    await api.put('/settings/profile', data)
  },
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/settings/password', data)
  },
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/settings/preferences')
    return response.data
  },
  updatePreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.put<UserPreferences>('/settings/preferences', data)
    return response.data
  },
  // Workspace
  getWorkspace: async (): Promise<Workspace> => {
    const response = await api.get<Workspace>('/settings/workspace')
    return response.data
  },
  updateWorkspace: async (data: UpdateWorkspaceRequest): Promise<Workspace> => {
    const response = await api.put<Workspace>('/settings/workspace', data)
    return response.data
  },
  testWebhook: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/settings/workspace/webhook/test')
    return response.data
  },
}

export interface UpdateProfileRequest {
  name: string
  email: string
}

export interface ChangePasswordRequest {
  current_password?: string
  new_password?: string
}

export interface UserPreferences {
  theme?: string
  notifications?: boolean
  weekly_digest?: boolean
  campaign_report_summary?: boolean
  alerts_bounces?: boolean
  alerts_failures?: boolean
}

export interface Workspace {
  id: string
  name: string
  default_from_name: string
  default_from_email: string
  pixel_tracking_enabled: boolean
  click_tracking_enabled: boolean
  webhook_endpoint?: string
}

export interface UpdateWorkspaceRequest {
  name?: string
  default_from_name?: string
  default_from_email?: string
}
