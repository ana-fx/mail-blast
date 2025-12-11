'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useNotifications, useNotificationActions } from '@/hooks/useNotifications'
import NotificationCard from '@/components/notifications/NotificationCard'
import MarkAllAsReadButton from '@/components/notifications/MarkAllAsReadButton'

export default function NotificationsPage() {
  const [queryClient] = useState(() => new QueryClient())
  const [activeTab, setActiveTab] = useState('all')
  const { data, isLoading } = useNotifications({
    type: activeTab === 'all' ? undefined : activeTab,
  })
  const { markAllAsRead, isMarkingAllAsRead } = useNotificationActions()

  const filteredNotifications = data?.notifications || []
  const unreadCount = data?.unread_count || 0

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
                Notifications
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {filteredNotifications.length > 0 && (
              <MarkAllAsReadButton
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
              />
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="campaign">Campaigns</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <Card>
                  <CardContent className="p-12">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No notifications found
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

