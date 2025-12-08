'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRoles, useRoleActions } from '@/hooks/useRoles'
import { useHasPermission } from '@/hooks/useHasPermission'
import NoAccess from '@/components/admin/NoAccess'

export default function RolesPage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const { data: roles, isLoading } = useRoles()
  const { delete: deleteRole } = useRoleActions()
  const hasPermission = useHasPermission('users.write')

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete role "${name}"? This action cannot be undone.`)) {
      deleteRole(id)
    }
  }

  if (!hasPermission) {
    return <NoAccess />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Role Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage user roles and permissions
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/roles/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Role
            </Button>
          </div>
        </motion.div>

        {/* Roles Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ) : roles && roles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-slate-500" />
                        <CardTitle>{role.name}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/roles/${role.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(role.id, role.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {role.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {role.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Permissions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(role.permissions || {}).map(([module, perms]) => {
                          const count = Object.values(perms).filter(Boolean).length
                          if (count === 0) return null
                          return (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}: {count}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No roles found. Create your first role to get started.
              </p>
              <Button
                onClick={() => router.push('/admin/roles/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </QueryClientProvider>
  )
}

