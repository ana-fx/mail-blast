'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Send, Calendar, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { campaignsApi } from '@/lib/api/campaigns'
import { useCampaignSend } from '@/hooks/useCampaignSend'
import ReviewCampaign from '@/components/campaign/ReviewCampaign'
import ConfirmSendModal from '@/components/campaign/ConfirmSendModal'
import { cn } from '@/lib/utils'

export default function CampaignReviewPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = (params?.id as string) || ''
  const [queryClient] = useState(() => new QueryClient())
  
  const [sendType, setSendType] = useState<'now' | 'later'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId),
    enabled: !!campaignId,
  })

  const { send, isSending, error } = useCampaignSend(campaignId)

  const handleSend = () => {
    if (sendType === 'now') {
      send({})
      setShowConfirmModal(false)
      router.push(`/campaigns/${campaignId}/queue-status`)
    } else {
      if (!scheduleDate || !scheduleTime) {
        alert('Please select a date and time')
        return
      }
      const sendAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      send({ send_at: sendAt })
      setShowConfirmModal(false)
      router.push(`/campaigns/${campaignId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Campaign not found</p>
      </div>
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
                Review Campaign
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Review and schedule your email campaign
              </p>
            </div>
          </div>
        </motion.div>

        {/* Review Content */}
        <ReviewCampaign campaign={campaign} />

        {/* Scheduling Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <CardTitle>Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="send_now"
                    name="send_type"
                    checked={sendType === 'now'}
                    onChange={() => setSendType('now')}
                    className="border-slate-300"
                  />
                  <Label htmlFor="send_now" className="text-sm font-medium text-slate-900 cursor-pointer">
                    Send Now
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="schedule_later"
                    name="send_type"
                    checked={sendType === 'later'}
                    onChange={() => setSendType('later')}
                    className="border-slate-300"
                  />
                  <Label htmlFor="schedule_later" className="text-sm font-medium text-slate-900 cursor-pointer">
                    Schedule Later
                  </Label>
                </div>
              </div>

              {sendType === 'later' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4 pt-4 border-t"
                >
                  <div className="space-y-2">
                    <Label htmlFor="schedule_date">Date</Label>
                    <Input
                      id="schedule_date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule_time">Time</Label>
                    <Input
                      id="schedule_time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex justify-end gap-3 pt-4 border-t"
        >
          <Button
            variant="outline"
            onClick={() => router.push(`/campaigns/${campaignId}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSending || (sendType === 'later' && (!scheduleDate || !scheduleTime))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendType === 'now' ? 'Send Campaign' : 'Schedule Campaign'}
          </Button>
        </motion.div>

        {/* Confirm Modal */}
        <ConfirmSendModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSend}
          campaign={campaign}
          isSending={isSending}
        />

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-sm text-red-800">
              Failed to send campaign. Please try again.
            </p>
          </motion.div>
        )}
      </div>
    </QueryClientProvider>
  )
}

