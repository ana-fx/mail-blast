'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRoleActions } from '@/hooks/useRoles'
import { useHasPermission } from '@/hooks/useHasPermission'
import PermissionMatrix from '@/components/admin/PermissionMatrix'
import NoAccess from '@/components/admin/NoAccess'
import { CreateRoleRequest } from '@/lib/api/admin'

export default function NewRolePage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const { create, isCreating } = useRoleActions()
  const hasPermission = useHasPermission('users.write')
  const [permissions, setPermissions] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>({
    campaigns: { read: false, write: false, delete: false },
    contacts: { read: false, write: false, delete: false },
    templates: { read: false, write: false, delete: false },
    analytics: { read: false, write: false, delete: false },
    settings: { read: false, write: false, delete: false },
    users: { read: false, write: false, delete: false },
  })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handlePermissionChange = (module: string, permission: 'read' | 'write' | 'delete', value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value,
        // Auto-disable write if read is disabled
        ...(permission === 'read' && !value ? { write: false, delete: false } : {}),
        // Auto-disable delete if write is disabled
        ...(permission === 'write' && !value ? { delete: false } : {}),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: CreateRoleRequest = {
      name,
      description: description || undefined,
      permissions,
    }
    create(data, {
      onSuccess: (role) => {
        router.push(`/admin/roles/${role.id}`)
      },
    })
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
                Create New Role
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Define a new role with custom permissions
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
                    placeholder="Editor"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Can edit campaigns and contacts"
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
            <Button type="submit" disabled={isCreating || !name}>
              {isCreating ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </QueryClientProvider>
  )
}

