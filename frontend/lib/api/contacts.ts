'use client'

import api from '@/lib/axios'

export interface Contact {
  id: string
  email: string
  first_name?: string
  last_name?: string
  status: 'active' | 'bounced' | 'complaint' | 'unsubscribed'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateContactRequest {
  email: string
  first_name?: string
  last_name?: string
  metadata?: Record<string, any>
}

export interface UpdateContactRequest {
  email?: string
  first_name?: string
  last_name?: string
  status?: string
  metadata?: Record<string, any>
}

export interface ImportContactsRequest {
  file: File
  field_mapping: {
    email: string
    first_name?: string
    last_name?: string
  }
}

export interface ContactsListResponse {
  contacts: Contact[]
  total: number
  page: number
  limit: number
}

export const contactsApi = {
  list: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<ContactsListResponse> => {
    const response = await api.get<ContactsListResponse>('/contacts', { params })
    return response.data
  },
  get: async (id: string): Promise<Contact> => {
    const response = await api.get<Contact>(`/contacts/${id}`)
    return response.data
  },
  create: async (data: CreateContactRequest): Promise<Contact> => {
    const response = await api.post<Contact>('/contacts', data)
    return response.data
  },
  update: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    const response = await api.patch<Contact>(`/contacts/${id}`, data)
    return response.data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`)
  },
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/contacts/bulk-delete', { ids })
  },
  import: async (data: ImportContactsRequest): Promise<{ imported: number; errors: number }> => {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('field_mapping', JSON.stringify(data.field_mapping))
    const response = await api.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  getEvents: async (id: string): Promise<any[]> => {
    const response = await api.get(`/contacts/${id}/events`)
    return response.data
  },
  getLists: async (id: string): Promise<any[]> => {
    const response = await api.get(`/contacts/${id}/lists`)
    return response.data
  },
}

