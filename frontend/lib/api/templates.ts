'use client'

import api from '@/lib/axios'

export interface Template {
  id: string
  name: string
  description?: string
  html: string
  version_count: number
  created_at: string
  updated_at: string
  latest_version?: TemplateVersion
}

export interface TemplateVersion {
  id: string
  version: number
  html: string
  created_at: string
  created_by?: string
  is_default: boolean
}

export interface CreateTemplateRequest {
  name: string
  description?: string
  html: string
}

export interface UpdateTemplateRequest {
  name?: string
  description?: string
  html?: string
}

export const templatesApi = {
  list: async (): Promise<Template[]> => {
    const response = await api.get<Template[]>('/templates')
    return response.data
  },
  get: async (id: string): Promise<Template> => {
    const response = await api.get<Template>(`/templates/${id}`)
    return response.data
  },
  create: async (data: CreateTemplateRequest): Promise<Template> => {
    const response = await api.post<Template>('/templates', data)
    return response.data
  },
  update: async (id: string, data: UpdateTemplateRequest): Promise<Template> => {
    const response = await api.put<Template>(`/templates/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`)
  },
  duplicate: async (id: string, name?: string): Promise<Template> => {
    const response = await api.post<Template>(`/templates/${id}/duplicate`, { name })
    return response.data
  },
  getVersions: async (id: string): Promise<TemplateVersion[]> => {
    const response = await api.get<TemplateVersion[]>(`/templates/${id}/versions`)
    return response.data
  },
  getVersion: async (id: string, versionId: string): Promise<TemplateVersion> => {
    const response = await api.get<TemplateVersion>(`/templates/${id}/versions/${versionId}`)
    return response.data
  },
  createVersion: async (id: string, html: string): Promise<TemplateVersion> => {
    const response = await api.post<TemplateVersion>(`/templates/${id}/versions`, { html })
    return response.data
  },
  restoreVersion: async (id: string, versionId: string): Promise<void> => {
    await api.post(`/templates/${id}/restore`, { version_id: versionId })
  },
  setDefaultVersion: async (id: string, versionId: string): Promise<void> => {
    await api.post(`/templates/${id}/versions/${versionId}/set-default`)
  },
}

