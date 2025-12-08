'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Trash2, AlertCircle, XCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useErrorLogs, useErrorLogActions } from '@/hooks/useInternal'
import { ErrorLog } from '@/lib/api/internal'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function ErrorLogsViewer() {
  const [filterType, setFilterType] = useState<string>('all')
  const { data: logs, isLoading } = useErrorLogs(filterType === 'all' ? undefined : filterType)
  const { delete: deleteLogs, isDeleting } = useErrorLogActions()

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/internal/logs/download${filterType !== 'all' ? `?type=${filterType}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
            'X-Internal-Key': process.env.NEXT_PUBLIC_INTERNAL_KEY || '',
          },
        }
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-logs-${filterType}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download logs:', error)
    }
  }

  const handleClear = () => {
    if (confirm('Clear all error logs? This cannot be undone.')) {
      deleteLogs(filterType === 'all' ? undefined : filterType)
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Error Logs Viewer</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">View and manage system error logs</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="api">API Errors</SelectItem>
              <SelectItem value="worker">Worker Errors</SelectItem>
              <SelectItem value="rate_limit">Rate Limit</SelectItem>
              <SelectItem value="smtp">SMTP Errors</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="destructive" onClick={handleClear} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <Badge variant={log.level === 'error' ? 'destructive' : 'outline'}>
                          {log.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate" title={log.message}>
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                    <TableCell>
                      {log.stack_trace && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            alert(log.stack_trace)
                          }}
                        >
                          View Stack
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No error logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

