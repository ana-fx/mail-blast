'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateWebhookRequest } from '@/lib/api/webhooks'

interface WebhookCreateDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateWebhookRequest, options?: { onSuccess?: (data: any) => void }) => void
  isSubmitting?: boolean
}

const availableEvents = [
  'campaign.created',
  'campaign.sent',
  'campaign.failed',
  'email.delivered',
  'email.bounced',
  'email.complaint',
  'email.clicked',
  'email.opened',
  'contact.created',
  'contact.updated',
]

export default function WebhookCreateDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: WebhookCreateDialogProps) {
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [secret, setSecret] = useState('')

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event))
    } else {
      setSelectedEvents([...selectedEvents, event])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || selectedEvents.length === 0) return

    const data: CreateWebhookRequest = {
      url,
      event_types: selectedEvents,
      secret: secret || undefined,
    }

    onSubmit(data, {
      onSuccess: () => {
        setUrl('')
        setSelectedEvents([])
        setSecret('')
        onClose()
      },
    })
  }

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const secret = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setSecret(secret)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Webhook</DialogTitle>
          <DialogDescription>
            Configure a webhook to receive real-time events from your email platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The endpoint that will receive webhook events
            </p>
          </div>

          <div className="space-y-2">
            <Label>Event Types *</Label>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {availableEvents.map((event) => {
                    const isSelected = selectedEvents.includes(event)
                    return (
                      <Badge
                        key={event}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleEvent(event)}
                      >
                        {event}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select the events you want to receive
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="secret">Secret Token (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSecret}
              >
                Generate
              </Button>
            </div>
            <Input
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Auto-generated if left blank"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Used to verify webhook requests. Leave blank to auto-generate.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !url || selectedEvents.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

