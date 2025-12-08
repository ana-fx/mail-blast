'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSMTPStats } from '@/hooks/useInternal'
import { formatNumber, formatPercentage } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function SMTPDashboard() {
  const { data: stats, isLoading } = useSMTPStats()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!stats) {
    return <div>No SMTP stats available</div>
  }

  const usagePercent = (stats.daily_usage / stats.daily_limit) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">SMTP Usage Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Email provider statistics and limits</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.daily_usage)} / {formatNumber(stats.daily_limit)}
            </div>
            <Progress value={usagePercent} className="mt-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatPercentage(usagePercent)} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.remaining)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Emails available today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Per Hour Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.per_hour_rate)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Emails per hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.rejection_percentage)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rejected emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.history_7d}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Sent" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
                <Line type="monotone" dataKey="bounced" stroke="#f59e0b" name="Bounced" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>30-Day History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.history_30d}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Sent" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
                <Line type="monotone" dataKey="bounced" stroke="#f59e0b" name="Bounced" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPercentage(stats.bounce_rate)}</div>
          </CardContent>
        </Card>

        {stats.ip_reputation && (
          <Card>
            <CardHeader>
              <CardTitle>IP Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.ip_reputation}</div>
              <Badge variant={stats.ip_reputation > 80 ? 'default' : 'destructive'} className="mt-2">
                {stats.ip_reputation > 80 ? 'Good' : 'Poor'}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

