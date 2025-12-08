'use client'

import { useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAnalyticsTimeline } from '@/lib/api/hooks/useAnalytics'
import { formatNumber } from '@/lib/utils'

interface TimelineChartProps {
  initialRange?: '7d' | '30d' | '90d'
}

export default function TimelineChart({ initialRange = '30d' }: TimelineChartProps) {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>(initialRange)
  const { data, isLoading } = useAnalyticsTimeline(range)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-slate-500">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Timeline</CardTitle>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Sent" />
            <Line type="monotone" dataKey="delivered" stroke="#10b981" name="Delivered" />
            <Line type="monotone" dataKey="opens" stroke="#f59e0b" name="Opens" />
            <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" name="Clicks" />
            <Line type="monotone" dataKey="bounces" stroke="#ef4444" name="Bounces" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

