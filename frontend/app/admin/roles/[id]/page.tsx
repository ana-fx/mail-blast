'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useRole, useRoleActions } from '@/hooks/useRoles'
import { useHasPermission } from '@/hooks/useHasPermission'
import PermissionMatrix from '@/components/admin/PermissionMatrix'
import NoAccess from '@/components/admin/NoAccess'
import { UpdateRoleRequest } from '@/lib/api/admin'

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = (params?.id as string) || ''
  const [queryClient] = useState(() => new QueryClient())
  const [permissions, setPermissions] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const hasPermission = useHasPermission('users.write')
  const { data: role, isLoading } = useRole(roleId)
  const { update, isUpdating } = useRoleActions()

  useEffect(() => {
    if (role) {
      setName(role.name)
      setDescription(role.description || '')
      setPermissions(role.permissions || {})
    }
  }, [role])

  const handlePermissionChange = (module: string, permission: 'read' | 'write' | 'delete', value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value,
        ...(permission === 'read' && !value ? { write: false, delete: false } : {}),
        ...(permission === 'write' && !value ? { delete: false } : {}),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: UpdateRoleRequest = {
      name,
      description: description || undefined,
      permissions,
    }
    update({ id: roleId, data }, {
      onSuccess: () => {
        router.push('/admin/roles')
      },
    })
  }

  if (!hasPermission) {
    return <NoAccess />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Role not found</h1>
        <Button onClick={() => router.push('/admin/roles')}>Back to Roles</Button>
      </div>
    )
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/roles')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Edit Role
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {role.name}
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Permissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <PermissionMatrix
              permissions={permissions}
              onChange={handlePermissionChange}
            />
          </motion.div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isUpdating || !name}>
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </form>
      </div>
    </QueryClientProvider>
  )
}

