'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, MoreVertical, Send, Copy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Webhook } from '@/lib/api/webhooks'
import { formatDateTime } from '@/lib/utils'
import { useWebhookActions } from '@/hooks/useWebhooks'
import WebhookStatusBadge from './WebhookStatusBadge'

interface WebhookListProps {
  webhooks: Webhook[]
  onEdit: (id: string) => void
  onTest?: (id: string) => void
}

export default function WebhookList({ webhooks, onEdit, onTest }: WebhookListProps) {
  const { delete: deleteWebhook, isDeleting } = useWebhookActions()

  const handleDelete = (id: string) => {
    if (confirm('Delete this webhook? This action cannot be undone.')) {
      deleteWebhook(id)
    }
  }

  const handleTest = (id: string) => {
    onTest?.(id)
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800 sticky top-0">
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Last Delivery</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.map((webhook) => (
            <motion.tr
              key={webhook.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
                    {webhook.url}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopy(webhook.url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <WebhookStatusBadge status={webhook.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {webhook.event_types.slice(0, 3).map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                  {webhook.event_types.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{webhook.event_types.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {webhook.last_delivery_result ? (
                  <div className="space-y-1">
                    <WebhookStatusBadge
                      status={webhook.last_delivery_result.status === 'success' ? 'active' : 'inactive'}
                      variant="delivery"
                    />
                    {webhook.last_delivery_result.delivered_at && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(webhook.last_delivery_result.delivered_at)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">Never</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {formatDateTime(webhook.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(webhook.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTest(webhook.id)}>
                      <Send className="h-4 w-4 mr-2" />
                      Test Webhook
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

