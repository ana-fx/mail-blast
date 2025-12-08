'use client'

import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ActivityLog } from '@/lib/api/notifications'
import { formatDateTime } from '@/lib/utils'

interface ActivityTableProps {
  logs: ActivityLog[]
}

const actionColors: Record<string, string> = {
  'login.success': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'login.failure': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'password.changed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'user.created': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'user.updated': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'user.deleted': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'api_key.created': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  'api_key.deleted': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'campaign.created': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'campaign.updated': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'campaign.deleted': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'email.delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'email.bounced': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'email.complaint': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'email.rejected': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ActivityTable({ logs }: ActivityTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800 sticky top-0">
          <TableRow>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(log.actor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                      {log.actor.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {log.actor.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={actionColors[log.action] || ''}
                >
                  {log.action.replace('.', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                {log.target_name ? (
                  <div>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {log.target_type}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {log.target_name}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {log.target_type}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {log.ip_address || '-'}
              </TableCell>
              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {formatDateTime(log.created_at)}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

