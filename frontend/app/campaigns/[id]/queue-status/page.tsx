'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { campaignsApi } from '@/lib/api/campaigns'
import { useCampaignStats } from '@/hooks/useCampaignSend'
import { cn } from '@/lib/utils'

export default function CampaignQueueStatusPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = (params?.id as string) || ''
  const [queryClient] = useState(() => new QueryClient())

  const { data: stats, isLoading, error } = useCampaignStats(campaignId, true)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case 'queued':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      sent: 'default',
      processing: 'secondary',
      queued: 'secondary',
      failed: 'destructive',
      draft: 'outline',
    }
    return (
      <Badge variant={variants[status] as any || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/campaigns/${campaignId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Sending Status
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Real-time campaign sending progress
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-red-600">
                <XCircle className="h-12 w-12 mx-auto mb-4" />
                <p>Failed to load sending status</p>
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <>
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Campaign Status</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stats.status)}
                      {getStatusBadge(stats.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Progress</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {stats.progress_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={stats.progress_percentage} className="h-2" />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.total_recipients.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Queued</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.queued.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400 mb-1">Sent</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.sent.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {stats.failed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Auto-refresh indicator */}
            {stats.status === 'processing' || stats.status === 'queued' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-slate-500 dark:text-slate-400"
              >
                <Loader2 className="h-4 w-4 inline-block animate-spin mr-2" />
                Auto-refreshing every 3 seconds...
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Button
                  onClick={() => router.push(`/campaigns/${campaignId}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Campaign
                </Button>
              </motion.div>
            )}
          </>
        ) : null}
      </div>
    </QueryClientProvider>
  )
}

