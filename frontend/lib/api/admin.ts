'use client'

import api from '@/lib/axios'

export interface User {
  id: string
  email: string
  name: string
  role: string
  status: 'active' | 'disabled'
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Record<string, {
    read: boolean
    write: boolean
    delete: boolean
  }>
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password?: string
  role: string
  send_invite?: boolean
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: string
  status?: 'active' | 'disabled'
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions?: Record<string, {
    read: boolean
    write: boolean
    delete: boolean
  }>
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: Record<string, {
    read: boolean
    write: boolean
    delete: boolean
  }>
}

export interface UsersListResponse {
  users: User[]
  total: number
  page: number
  per_page: number
}

export const adminApi = {
  // Users
  getUsers: async (params?: {
    search?: string
    page?: number
    role?: string
  }): Promise<UsersListResponse> => {
    const response = await api.get<UsersListResponse>('/admin/users', { params })
    return response.data
  },
  getUser: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${id}`)
    return response.data
  },
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/admin/users', data)
    return response.data
  },
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/admin/users/${id}`, data)
    return response.data
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },
  updateUserStatus: async (id: string, status: 'active' | 'disabled'): Promise<void> => {
    await api.patch(`/admin/users/${id}/status`, { status })
  },
  resetUserPassword: async (id: string): Promise<{ password: string }> => {
    const response = await api.post<{ password: string }>(`/admin/users/${id}/reset-password`)
    return response.data
  },
  // Roles
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/admin/roles')
    return response.data
  },
  getRole: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(`/admin/roles/${id}`)
    return response.data
  },
  createRole: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await api.post<Role>('/admin/roles', data)
    return response.data
  },
  updateRole: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
    const response = await api.put<Role>(`/admin/roles/${id}`, data)
    return response.data
  },
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/admin/roles/${id}`)
  },
  getRolePermissions: async (id: string): Promise<Role['permissions']> => {
    const response = await api.get<Role['permissions']>(`/admin/roles/${id}/permissions`)
    return response.data
  },
  updateRolePermissions: async (id: string, permissions: Role['permissions']): Promise<void> => {
    await api.put(`/admin/roles/${id}/permissions`, { permissions })
  },
  // Logs
  getLogs: async (page: number = 1, level?: string): Promise<any> => {
    const response = await api.get('/admin/logs', { params: { page, level } })
    return response.data
  },
}
