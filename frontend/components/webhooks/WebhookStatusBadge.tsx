'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

interface WebhookStatusBadgeProps {
  status: 'active' | 'inactive' | 'success' | 'failed' | 'retrying'
  variant?: 'default' | 'delivery'
}

export default function WebhookStatusBadge({
  status,
  variant = 'default',
}: WebhookStatusBadgeProps) {
  if (variant === 'delivery') {
    const deliveryMap = {
      success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', label: 'Delivered' },
      failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20', label: 'Failed' },
      retrying: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20', label: 'Retrying' },
    }
    const config = deliveryMap[status as keyof typeof deliveryMap] || deliveryMap.failed
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const statusMap = {
    active: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20', label: 'Active' },
    inactive: { icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', label: 'Inactive' },
  }
  const config = statusMap[status as keyof typeof statusMap] || statusMap.inactive
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

