'use client'

import api from '@/lib/axios'

export interface List {
  id: string
  name: string
  description?: string
  tags?: string[]
  contact_count: number
  created_at: string
  updated_at: string
}

export interface CreateListRequest {
  name: string
  description?: string
  tags?: string[]
}

export interface UpdateListRequest {
  name?: string
  description?: string
  tags?: string[]
}

export interface ListsListResponse {
  lists: List[]
  total: number
  page: number
  limit: number
}

export interface ListContactsResponse {
  contacts: any[]
  total: number
  page: number
  limit: number
}

export const listsApi = {
  list: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ListsListResponse> => {
    const response = await api.get<ListsListResponse>('/lists', { params })
    return response.data
  },
  get: async (id: string): Promise<List> => {
    const response = await api.get<List>(`/lists/${id}`)
    return response.data
  },
  create: async (data: CreateListRequest): Promise<List> => {
    const response = await api.post<List>('/lists', data)
    return response.data
  },
  update: async (id: string, data: UpdateListRequest): Promise<List> => {
    const response = await api.patch<List>(`/lists/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/lists/${id}`)
  },
  getContacts: async (id: string, params?: {
    page?: number
    limit?: number
  }): Promise<ListContactsResponse> => {
    const response = await api.get<ListContactsResponse>(`/lists/${id}/contacts`, { params })
    return response.data
  },
  addContacts: async (id: string, contactIds: string[]): Promise<void> => {
    await api.post(`/lists/${id}/add-contacts`, { contact_ids: contactIds })
  },
  removeContact: async (id: string, contactId: string): Promise<void> => {
    await api.post(`/lists/${id}/remove-contact`, { contact_id: contactId })
  },
}

