'use client'

import { motion } from 'framer-motion'
import { Play, Pause, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useScheduledTasks, useTaskActions } from '@/hooks/useInternal'
import { ScheduledTask } from '@/lib/api/internal'
import { formatDateTime } from '@/lib/utils'

export default function TaskScheduler() {
  const { data: tasks, isLoading } = useScheduledTasks()
  const { run, toggle, isRunning, isToggling } = useTaskActions()

  const handleRunNow = (id: string) => {
    if (confirm('Run this task now?')) {
      run(id)
    }
  }

  const handleToggle = (id: string, enabled: boolean) => {
    toggle({ id, enabled })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Task Scheduler</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage background cron tasks</p>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : tasks && tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Last Result</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {task.schedule}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={task.enabled}
                          onCheckedChange={(checked) => handleToggle(task.id, checked)}
                          disabled={isToggling}
                        />
                        <Badge variant={task.enabled ? 'default' : 'outline'}>
                          {task.enabled ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.last_run ? formatDateTime(task.last_run) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {task.last_result ? (
                        <div className="flex items-center gap-1">
                          {task.last_result === 'success' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Success</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600">Failed</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.next_run ? formatDateTime(task.next_run) : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRunNow(task.id)}
                        disabled={isRunning}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No scheduled tasks found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

