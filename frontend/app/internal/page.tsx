'use client'

import { motion } from 'framer-motion'
import { Activity, Server, Database, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQueues, useSMTPStats, useServerHealth, useErrorLogs } from '@/hooks/useInternal'
import { formatNumber } from '@/lib/utils'

export default function InternalDashboard() {
  const { data: queues } = useQueues()
  const { data: smtpStats } = useSMTPStats()
  const { data: serverHealth } = useServerHealth()
  const { data: errorLogs } = useErrorLogs()

  const totalQueueLength = queues?.reduce((sum, q) => sum + q.length, 0) || 0
  const totalFailedJobs = queues?.reduce((sum, q) => sum + q.failed_jobs.length, 0) || 0
  const recentErrors = errorLogs?.filter((log) => log.level === 'error').slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Internal Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            System monitoring and DevOps console
          </p>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalQueueLength)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {totalFailedJobs} failed jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMTP Usage</CardTitle>
            <Server className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {smtpStats ? (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(smtpStats.daily_usage)} / {formatNumber(smtpStats.daily_limit)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {((smtpStats.daily_usage / smtpStats.daily_limit) * 100).toFixed(1)}% used
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Health</CardTitle>
            <Database className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {serverHealth ? (
              <>
                <div className="text-2xl font-bold">
                  CPU: {serverHealth.cpu_usage_percent.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  RAM: {serverHealth.ram_usage_percent.toFixed(1)}%
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentErrors.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last 5 errors
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/internal/queues"
                className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Activity className="h-6 w-6 mb-2 text-blue-600" />
                <p className="text-sm font-medium">Queues</p>
              </a>
              <a
                href="/internal/smtp"
                className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Server className="h-6 w-6 mb-2 text-green-600" />
                <p className="text-sm font-medium">SMTP Stats</p>
              </a>
              <a
                href="/internal/logs"
                className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <AlertTriangle className="h-6 w-6 mb-2 text-red-600" />
                <p className="text-sm font-medium">Error Logs</p>
              </a>
              <a
                href="/internal/recovery"
                className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Database className="h-6 w-6 mb-2 text-purple-600" />
                <p className="text-sm font-medium">Recovery</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

