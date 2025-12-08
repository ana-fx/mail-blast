'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Mail,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  Users,
  Key,
  Bell,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Notification } from '@/lib/api/notifications'
import { useNotificationActions } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface NotificationCardProps {
  notification: Notification
  onClose?: () => void
}

const iconMap: Record<string, any> = {
  'campaign.sent': Send,
  'campaign.scheduled': Calendar,
  'campaign.failed': XCircle,
  'email.bounce': AlertCircle,
  'email.complaint': AlertCircle,
  'email.delivery_failure': XCircle,
  'system.api_key_expiring': Key,
  'system.ses_limit': AlertCircle,
  'system.tracking_domain': AlertCircle,
  'team.user_added': Users,
  'team.role_changed': Shield,
  'team.member_removed': Users,
}

const colorMap: Record<string, string> = {
  'campaign.sent': 'text-green-600',
  'campaign.scheduled': 'text-blue-600',
  'campaign.failed': 'text-red-600',
  'email.bounce': 'text-orange-600',
  'email.complaint': 'text-red-600',
  'email.delivery_failure': 'text-red-600',
  'system.api_key_expiring': 'text-yellow-600',
  'system.ses_limit': 'text-yellow-600',
  'system.tracking_domain': 'text-red-600',
  'team.user_added': 'text-blue-600',
  'team.role_changed': 'text-purple-600',
  'team.member_removed': 'text-red-600',
}

export default function NotificationCard({
  notification,
  onClose,
}: NotificationCardProps) {
  const router = useRouter()
  const { markAsRead } = useNotificationActions()

  const Icon = iconMap[notification.category] || Bell
  const iconColor = colorMap[notification.category] || 'text-slate-600'

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.metadata?.link) {
      router.push(notification.metadata.link)
      onClose?.()
    } else if (notification.metadata?.campaign_id) {
      router.push(`/campaigns/${notification.metadata.campaign_id}`)
      onClose?.()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
          !notification.read && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className={cn('flex-shrink-0', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {notification.description}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {formatRelativeTime(notification.created_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

