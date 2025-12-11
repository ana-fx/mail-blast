// Common API Types
export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    page?: number
    per_page?: number
    total?: number
    has_more?: boolean
  }
}

export interface ApiErrorResponse {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    has_more: boolean
  }
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  token_type: string
  expires_in: number
  user: User
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar_url?: string
}

// Campaign Types
export interface Campaign {
  id: string
  name: string
  subject: string
  from_name: string
  from_email: string
  reply_to?: string
  content: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  send_at?: string
  created_at: string
  updated_at: string
}

export interface CreateCampaignRequest {
  name: string
  subject: string
  from_name: string
  from_email: string
  reply_to?: string
  content?: string
}

// Contact Types
export interface Contact {
  id: string
  email: string
  first_name?: string
  last_name?: string
  status: 'active' | 'bounced' | 'complaint' | 'unsubscribed'
  lists?: string[]
  created_at: string
  updated_at: string
}

// Template Types
export interface Template {
  id: string
  name: string
  description?: string
  content: string
  version: number
  created_at: string
  updated_at: string
}

// Analytics Types
export interface AnalyticsOverview {
  total_sent: number
  total_delivered: number
  total_opened: number
  total_clicked: number
  total_bounced: number
  total_failed: number
  delivery_rate: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  failed_rate: number
}

export interface TimelinePoint {
  date: string
  sent: number
  delivered: number
  opens: number
  clicks: number
  bounces: number
}

// Settings Types
export interface SystemSettings {
  app_name: string
  default_from_email: string
  default_from_name: string
  reply_to_email: string
  timezone: string
  base_url: string
}

export interface TrackingSettings {
  open_tracking: boolean
  click_tracking: boolean
  custom_tracking_domain?: string
}

