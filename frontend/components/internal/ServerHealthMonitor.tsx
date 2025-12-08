'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useServerHealth } from '@/hooks/useInternal'
import { formatNumber } from '@/lib/utils'

export default function ServerHealthMonitor() {
  const { data: health, isLoading } = useServerHealth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!health) {
    return <div>No server health data available</div>
  }

  const uptimeHours = Math.floor(health.uptime_seconds / 3600)
  const uptimeDays = Math.floor(uptimeHours / 24)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Server Health Monitor</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time system metrics</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.cpu_usage_percent.toFixed(1)}%</div>
            <Progress value={health.cpu_usage_percent} className="mt-2" />
            <Badge
              variant={health.cpu_usage_percent > 80 ? 'destructive' : health.cpu_usage_percent > 60 ? 'default' : 'outline'}
              className="mt-2"
            >
              {health.cpu_usage_percent > 80 ? 'High' : health.cpu_usage_percent > 60 ? 'Medium' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">RAM Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.ram_usage_percent.toFixed(1)}%</div>
            <Progress value={health.ram_usage_percent} className="mt-2" />
            <Badge
              variant={health.ram_usage_percent > 80 ? 'destructive' : health.ram_usage_percent > 60 ? 'default' : 'outline'}
              className="mt-2"
            >
              {health.ram_usage_percent > 80 ? 'High' : health.ram_usage_percent > 60 ? 'Medium' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.disk_usage_percent.toFixed(1)}%</div>
            <Progress value={health.disk_usage_percent} className="mt-2" />
            <Badge
              variant={health.disk_usage_percent > 90 ? 'destructive' : health.disk_usage_percent > 80 ? 'default' : 'outline'}
              className="mt-2"
            >
              {health.disk_usage_percent > 90 ? 'Critical' : health.disk_usage_percent > 80 ? 'Warning' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptimeDays}d {uptimeHours % 24}h</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatNumber(health.uptime_seconds)} seconds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Network In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{health.network_in_mbps.toFixed(2)} Mbps</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{health.network_out_mbps.toFixed(2)} Mbps</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Node.js Logs (Last 20 lines)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
              {health.node_logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {health.nginx_logs && (
          <Card>
            <CardHeader>
              <CardTitle>Nginx Logs (Last 20 lines)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-blue-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                {health.nginx_logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

