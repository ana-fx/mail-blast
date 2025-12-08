'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check } from 'lucide-react'
import { analyticsApi, type EventDetails, type EmailEvent } from '@/lib/api/analytics'
import { formatDateTime } from '@/lib/utils'

interface EventModalProps {
  messageId: string | null
  open: boolean
  onClose: () => void
}

export default function EventModal({ messageId, open, onClose }: EventModalProps) {
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'event', messageId],
    queryFn: () => analyticsApi.getEventsByMessageId(messageId!),
    enabled: !!messageId && open,
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return '📧'
      case 'delivered':
        return '✓'
      case 'opened':
        return '👁️'
      case 'clicked':
        return '🖱️'
      case 'bounce':
        return '❌'
      case 'complaint':
        return '⚠️'
      default:
        return '•'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-4 py-4">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.subject && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">Subject</label>
                    <p className="text-sm text-slate-900">{data.subject}</p>
                  </div>
                )}
                {data.to && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">To</label>
                    <p className="text-sm text-slate-900">{data.to}</p>
                  </div>
                )}
                {data.from && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">From</label>
                    <p className="text-sm text-slate-900">{data.from}</p>
                  </div>
                )}
                {data.status && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">Status</label>
                    <p className="text-sm text-slate-900">{data.status}</p>
                  </div>
                )}
                {data.campaign && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">Campaign</label>
                    <p className="text-sm text-slate-900">{data.campaign.title}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="events" className="w-full">
              <TabsList>
                <TabsTrigger value="events">Events Timeline</TabsTrigger>
                <TabsTrigger value="json">Raw JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-2">
                {data.events && data.events.length > 0 ? (
                  <div className="space-y-2">
                    {data.events.map((event: EmailEvent, index: number) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{getEventIcon(event.event_type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-slate-900 capitalize">
                                    {event.event_type}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatDateTime(event.created_at)}
                                  </span>
                                </div>
                                {event.recipient_email && (
                                  <p className="text-xs text-slate-600 mt-1">
                                    {event.recipient_email}
                                  </p>
                                )}
                                {event.meta && Object.keys(event.meta).length > 0 && (
                                  <div className="mt-2 text-xs text-slate-500">
                                    {Object.entries(event.meta).map(([key, value]) => (
                                      <div key={key}>
                                        <span className="font-medium">{key}:</span> {String(value)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                      No events found
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="json">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Raw Event Data</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy JSON
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-slate-50 p-4 rounded-md overflow-x-auto">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            No event data found
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

