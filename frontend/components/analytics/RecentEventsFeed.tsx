'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, CheckCircle, Eye, MousePointerClick, XCircle, AlertTriangle } from 'lucide-react'
import { analyticsApi, type EmailEvent } from '@/lib/api/analytics'
import { formatDateTime } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface RecentEventsFeedProps {
  onEventClick?: (event: EmailEvent) => void
}

export default function RecentEventsFeed({ onEventClick }: RecentEventsFeedProps) {
  const pollingEnabled = process.env.NEXT_PUBLIC_ENABLE_POLLING === 'true'

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'recent-events', 25],
    queryFn: () => analyticsApi.getRecentEvents(25),
    refetchInterval: pollingEnabled ? 10000 : false, // Poll every 10s if enabled
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Mail className="h-4 w-4 text-blue-600" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'opened':
        return <Eye className="h-4 w-4 text-purple-600" />
      case 'clicked':
        return <MousePointerClick className="h-4 w-4 text-orange-600" />
      case 'bounce':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'complaint':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Mail className="h-4 w-4 text-slate-600" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'sent':
        return 'bg-blue-50 border-blue-200'
      case 'delivered':
        return 'bg-green-50 border-green-200'
      case 'opened':
        return 'bg-purple-50 border-purple-200'
      case 'clicked':
        return 'bg-orange-50 border-orange-200'
      case 'bounce':
        return 'bg-red-50 border-red-200'
      case 'complaint':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-slate-500">
            No events yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {data.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-shadow ${getEventColor(event.event_type)}`}
                onClick={() => onEventClick?.(event)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onEventClick?.(event)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Event ${event.event_type} at ${formatDateTime(event.created_at)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getEventIcon(event.event_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {event.event_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {event.recipient_email && (
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        {event.recipient_email}
                      </p>
                    )}
                    {event.campaign_name && (
                      <p className="text-xs text-slate-500 mt-1">
                        Campaign: {event.campaign_name}
                      </p>
                    )}
                    {event.message_id && (
                      <button
                        className="text-xs text-slate-400 mt-1 font-mono truncate hover:text-slate-600 text-left"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                      >
                        {event.message_id}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

