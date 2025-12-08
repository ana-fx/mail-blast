'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useUsers } from '@/hooks/useUsers'
import { useHasPermission } from '@/hooks/useHasPermission'
import UserTable from '@/components/admin/UserTable'
import NoAccess from '@/components/admin/NoAccess'

export default function UsersPage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const hasPermission = useHasPermission('users.read')

  const { data, isLoading } = useUsers({
    search: search || undefined,
    page,
    role: roleFilter || undefined,
  })

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
                User Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage users and their roles
              </p>
            </div>
            {useHasPermission('users.write') && (
              <Button
                onClick={() => router.push('/admin/users/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New User
              </Button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ) : data?.users && data.users.length > 0 ? (
            <>
              <UserTable
                users={data.users}
                onEdit={(id) => router.push(`/admin/users/${id}`)}
              />
              {/* Pagination */}
              {data.total > data.per_page && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {((page - 1) * data.per_page) + 1} to {Math.min(page * data.per_page, data.total)} of {data.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * data.per_page >= data.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No users found
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

