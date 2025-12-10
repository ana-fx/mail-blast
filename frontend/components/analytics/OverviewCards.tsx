'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, CheckCircle, XCircle, Eye, MousePointerClick, AlertTriangle } from 'lucide-react'
import { analyticsApi, type AnalyticsOverview } from '@/lib/api/analytics'

interface OverviewCardsProps {
  serverData?: AnalyticsOverview
}

export default function OverviewCards({ serverData }: OverviewCardsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: serverData,
  })

  const cards = [
    {
      title: 'Sent',
      value: data?.total_sent || 0,
      icon: Mail,
      color: 'text-slate-900',
      bgColor: 'bg-slate-50',
      sparklineData: [],
    },
    {
      title: 'Delivered',
      value: data?.total_delivered || 0,
      icon: CheckCircle,
      color: 'text-slate-900',
      bgColor: 'bg-slate-50',
      rate: data?.delivery_rate || 0,
      sparklineData: [],
    },
    {
      title: 'Opened',
      value: data?.total_opened || 0,
      icon: Eye,
      color: 'text-slate-900',
      bgColor: 'bg-slate-50',
      rate: data?.open_rate || 0,
      sparklineData: [],
    },
    {
      title: 'Clicked',
      value: data?.total_clicked || 0,
      icon: MousePointerClick,
      color: 'text-slate-900',
      bgColor: 'bg-slate-50',
      rate: data?.click_rate || 0,
      sparklineData: [],
    },
    {
      title: 'Bounced',
      value: data?.total_bounced || 0,
      icon: XCircle,
      color: 'text-slate-900',
      bgColor: 'bg-slate-50',
      rate: data?.bounce_rate || 0,
      sparklineData: [],
    },
    {
      title: 'Failed',
      value: data?.total_failed || 0,
      icon: AlertTriangle,
      color: 'text-slate-900',
      bgColor: 'bg-slate-50',
      sparklineData: [],
    },
  ]

  if (isLoading && !serverData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-full flex flex-col">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="h-full"
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-2xl font-bold text-slate-900">
                  {card.value.toLocaleString()}
                </div>
                {card.rate !== undefined ? (
                  <p className="text-xs text-slate-500 mt-1">
                    {card.rate.toFixed(1)}% rate
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 invisible">
                    &nbsp;
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

