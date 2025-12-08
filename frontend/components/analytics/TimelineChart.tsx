'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { analyticsApi, type TimelineData } from '@/lib/api/analytics'
import { useAnalyticsStore } from '@/store/analyticsStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface TimelineChartProps {
  initialRange?: '7d' | '30d' | '90d'
}

export default function TimelineChart({ initialRange = '30d' }: TimelineChartProps) {
  const { selectedRange, setRange } = useAnalyticsStore()
  const range = selectedRange || initialRange

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'timeline', range],
    queryFn: () => analyticsApi.getTimeline(range),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Performance Timeline</CardTitle>
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
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400} aria-label="Email performance timeline chart">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                {/* @ts-ignore */}
                <RechartsTooltip />
                <Legend />
                {/* @ts-ignore */}
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} name="Sent" />
                {/* @ts-ignore */}
                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} name="Delivered" />
                {/* @ts-ignore */}
                <Line type="monotone" dataKey="opened" stroke="#8b5cf6" strokeWidth={2} name="Opened" />
                {/* @ts-ignore */}
                <Line type="monotone" dataKey="clicked" stroke="#f97316" strokeWidth={2} name="Clicked" />
                {/* @ts-ignore */}
                <Line type="monotone" dataKey="bounces" stroke="#ef4444" strokeWidth={2} name="Bounces" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

