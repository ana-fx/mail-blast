'use client'

import { useState } from 'react'
import { Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestWebhookResponse } from '@/lib/api/webhooks'

interface WebhookEventTesterProps {
  open: boolean
  onClose: () => void
  webhookId: string
  onTest: (id: string) => void
  isTesting?: boolean
  testResult?: TestWebhookResponse | null
}

export default function WebhookEventTester({
  open,
  onClose,
  webhookId,
  onTest,
  isTesting = false,
  testResult,
}: WebhookEventTesterProps) {
  const handleTest = () => {
    onTest(webhookId)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Webhook</DialogTitle>
          <DialogDescription>
            Send a test event to verify your webhook is working
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            onClick={handleTest}
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Event
              </>
            )}
          </Button>

          {testResult && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-600">Test Successful</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-600">Test Failed</span>
                      </>
                    )}
                  </div>
                  {testResult.status_code && (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Status Code</p>
                      <Badge variant="outline">{testResult.status_code}</Badge>
                    </div>
                  )}
                  {testResult.response_time_ms && (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Response Time</p>
                      <p className="text-sm font-medium">{testResult.response_time_ms}ms</p>
                    </div>
                  )}
                  {testResult.error && (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Error</p>
                      <p className="text-sm text-red-600">{testResult.error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

