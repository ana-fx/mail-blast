'use client'

import { useAuthStore } from '@/store/authStore'

export function useHasPermission(permission: string): boolean {
  const { user } = useAuthStore()

  if (!user) return false

  // Super admin has all permissions
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  // Check if user has specific permission
  // This would typically come from the backend JWT or user object
  // For now, we'll do basic role-based checks
  const rolePermissions: Record<string, string[]> = {
    editor: ['campaigns.read', 'campaigns.write', 'contacts.read', 'contacts.write', 'templates.read', 'templates.write'],
    viewer: ['campaigns.read', 'contacts.read', 'templates.read', 'analytics.read'],
  }

  const permissions = rolePermissions[user.role] || []
  return permissions.includes(permission)
}

export function useIsAdmin(): boolean {
  const { user } = useAuthStore()
  return user?.role === 'admin' || user?.role === 'superadmin' || false
}

