'use client'

import api from '@/lib/axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
    client_id?: string
  }
  token: string
  token_type: string
  expires_in: number
  message: string
}

export interface RefreshTokenRequest {
  token: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/users/auth', data)
    return response.data
  },
  refreshToken: async (data: RefreshTokenRequest): Promise<{ token: string; expires_in: number }> => {
    const response = await api.post('/users/refresh', data)
    return response.data
  },
}

