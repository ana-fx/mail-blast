'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotifications, useNotificationActions } from '@/hooks/useNotifications'
import NotificationCard from './NotificationCard'
import MarkAllAsReadButton from './MarkAllAsReadButton'
import { Loader2 } from 'lucide-react'

interface NotificationListProps {
  onClose?: () => void
}

export default function NotificationList({ onClose }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState('all')
  const { data, isLoading } = useNotifications({
    type: activeTab === 'all' ? undefined : activeTab,
  })
  const { markAllAsRead, isMarkingAllAsRead } = useNotificationActions()

  const notifications = data?.notifications || []

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="campaign">Campaigns</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No notifications
            </p>
          </div>
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t">
          <MarkAllAsReadButton
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
          />
        </div>
      )}
    </div>
  )
}

