'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, CreateRoleRequest, UpdateRoleRequest } from '@/lib/api/admin'

export function useRoles() {
  return useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminApi.getRoles(),
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['admin-role', id],
    queryFn: () => adminApi.getRole(id),
    enabled: !!id,
  })
}

export function useRolePermissions(id: string) {
  return useQuery({
    queryKey: ['admin-role-permissions', id],
    queryFn: () => adminApi.getRolePermissions(id),
    enabled: !!id,
  })
}

export function useRoleActions() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => adminApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) => adminApi.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      queryClient.invalidateQueries({ queryKey: ['admin-role', variables.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
  })

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: any }) => adminApi.updateRolePermissions(id, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-permissions', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-role', variables.id] })
    },
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    updatePermissions: updatePermissionsMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingPermissions: updatePermissionsMutation.isPending,
  }
}

