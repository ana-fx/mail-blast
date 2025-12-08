'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useSystemSettings, useEmailStatus, useTrackingSettings } from '@/hooks/useSystemSettings'
import { useHasPermission } from '@/hooks/useHasPermission'
import SystemSettingsForm from '@/components/settings/SystemSettingsForm'
import TrackingSettingsForm from '@/components/settings/TrackingSettingsForm'
import NoAccess from '@/components/admin/NoAccess'
import SettingsSidebar from '@/components/settings/SettingsSidebar'

export default function SystemSettingsPage() {
  const [queryClient] = useState(() => new QueryClient())
  const hasPermission = useHasPermission('settings.update')
  const { settings, isLoading, update, isUpdating } = useSystemSettings()
  const { data: emailStatus, isLoading: emailLoading } = useEmailStatus()
  const { settings: trackingSettings, isLoading: trackingLoading, update: updateTracking, isUpdating: isUpdatingTracking } = useTrackingSettings()

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
                  System Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Configure system-wide settings and email provider
                </p>
              </div>
            </motion.div>

            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {isLoading ? (
                <Skeleton className="h-96" />
              ) : (
                <SystemSettingsForm
                  initialData={settings}
                  onSubmit={update}
                  isSubmitting={isUpdating}
                />
              )}
            </motion.div>

            {/* Email Provider Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Email Provider Status</CardTitle>
                  <CardDescription>
                    Current email service provider configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {emailLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : emailStatus ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Provider</p>
                          <p className="font-medium">{emailStatus.provider}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Region</p>
                          <p className="font-medium">{emailStatus.region}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Mode</p>
                          <Badge variant={emailStatus.mode === 'production' ? 'default' : 'secondary'}>
                            {emailStatus.mode}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Daily Limit</p>
                          <p className="font-medium">
                            {emailStatus.remaining_quota.toLocaleString()} / {emailStatus.daily_sending_limit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {emailStatus.verified_domains.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Verified Domains</p>
                          <div className="flex flex-wrap gap-2">
                            {emailStatus.verified_domains.map((domain) => (
                              <Badge key={domain} variant="outline">
                                {domain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tracking Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {trackingLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <TrackingSettingsForm
                  initialData={trackingSettings}
                  onSubmit={updateTracking}
                  isSubmitting={isUpdatingTracking}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

