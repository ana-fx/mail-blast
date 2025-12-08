'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useTeamSettings } from '@/hooks/useTeamSettings'
import { useUsers } from '@/hooks/useUsers'
import { useHasPermission } from '@/hooks/useHasPermission'
import TeamSettingsForm from '@/components/settings/TeamSettingsForm'
import NoAccess from '@/components/admin/NoAccess'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import { formatDateTime } from '@/lib/utils'

export default function TeamSettingsPage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const hasPermission = useHasPermission('settings.read')
  const { settings, isLoading, update, isUpdating } = useTeamSettings()
  const { data: usersData, isLoading: usersLoading } = useUsers({ page: 1 })

  if (!hasPermission) {
    return <NoAccess />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <SettingsSidebar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Team Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage your team profile and members
                </p>
              </div>
            </motion.div>

            {/* Team Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {isLoading ? (
                <Skeleton className="h-96" />
              ) : (
                <TeamSettingsForm
                  initialData={settings}
                  onSubmit={update}
                  isSubmitting={isUpdating}
                />
              )}
            </motion.div>

            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Quick access to team member management
                      </p>
                    </div>
                    {useHasPermission('users.read') && (
                      <Button
                        variant="outline"
                        onClick={() => router.push('/admin/users')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : usersData?.users && usersData.users.length > 0 ? (
                    <div className="space-y-3">
                      {usersData.users.slice(0, 5).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {user.name}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {usersData.users.length > 5 && (
                        <p className="text-sm text-center text-slate-500 dark:text-slate-400 pt-2">
                          And {usersData.users.length - 5} more members...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      No team members found
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

