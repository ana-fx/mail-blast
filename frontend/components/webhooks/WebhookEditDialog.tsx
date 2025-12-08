'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Webhook, UpdateWebhookRequest } from '@/lib/api/webhooks'

interface WebhookEditDialogProps {
  open: boolean
  onClose: () => void
  webhook: Webhook | null
  onSubmit: (id: string, data: UpdateWebhookRequest, options?: { onSuccess?: (data: any) => void }) => void
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

export default function WebhookEditDialog({
  open,
  onClose,
  webhook,
  onSubmit,
  isSubmitting = false,
}: WebhookEditDialogProps) {
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url)
      setSelectedEvents(webhook.event_types)
      setStatus(webhook.status)
    }
  }, [webhook])

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== event))
    } else {
      setSelectedEvents([...selectedEvents, event])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhook || !url || selectedEvents.length === 0) return

    const data: UpdateWebhookRequest = {
      url,
      event_types: selectedEvents,
      status,
    }

    onSubmit(webhook.id, data, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  if (!webhook) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Webhook</DialogTitle>
          <DialogDescription>
            Update webhook configuration
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
              required
            />
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
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status">Active</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enable or disable this webhook
              </p>
            </div>
            <Switch
              id="status"
              checked={status === 'active'}
              onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !url || selectedEvents.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Webhook'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

