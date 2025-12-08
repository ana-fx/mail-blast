'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Trash2, Play, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueues, useQueueActions } from '@/hooks/useInternal'
import { QueueStatus, FailedJob } from '@/lib/api/internal'
import { formatDateTime } from '@/lib/utils'

export default function QueueMonitor() {
  const { data: queues, isLoading } = useQueues()
  const { retry, clear, isRetrying, isClearing } = useQueueActions()
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null)

  const handleRetryAll = () => {
    if (confirm('Retry all failed jobs?')) {
      retry()
    }
  }

  const handleClearQueue = (queueName?: string) => {
    if (confirm(`Clear ${queueName || 'all'} queue(s)? This cannot be undone.`)) {
      clear(queueName)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Queue Monitor</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time queue status and workers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRetryAll}
            disabled={isRetrying}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry All Failed
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleClearQueue()}
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Queues
          </Button>
        </div>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {queues?.map((queue) => (
          <Card key={queue.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{queue.name}</CardTitle>
                <Badge variant={queue.length > 0 ? 'default' : 'outline'}>
                  {queue.length} jobs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Active Workers</p>
                  <p className="font-medium">{queue.active_workers} / {queue.concurrency}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Uptime</p>
                  <p className="font-medium">{Math.floor(queue.uptime_seconds / 3600)}h</p>
                </div>
              </div>
              {queue.failed_jobs.length > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {queue.failed_jobs.length} failed
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedQueue(expandedQueue === queue.name ? null : queue.name)}
                    >
                      {expandedQueue === queue.name ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleClearQueue(queue.name)}
                disabled={isClearing}
              >
                Clear Queue
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Failed Jobs */}
      {queues && queues.some((q) => q.failed_jobs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Failed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Failed At</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.flatMap((queue) =>
                  queue.failed_jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{queue.name}</TableCell>
                      <TableCell>
                        <div className="max-w-md truncate" title={job.error}>
                          {job.error}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(job.failed_at)}</TableCell>
                      <TableCell>{job.retry_count}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retry(queue.name)}
                          disabled={isRetrying}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

