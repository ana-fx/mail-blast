'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { campaignsApi } from '@/lib/api/campaigns'

interface SendTestModalProps {
  campaignId: string
  open: boolean
  onClose: () => void
}

export default function SendTestModal({ campaignId, open, onClose }: SendTestModalProps) {
  const [email, setEmail] = useState('')

  const sendTestMutation = useMutation({
    mutationFn: (email: string) => campaignsApi.sendTest(campaignId, { email }),
    onSuccess: () => {
      alert('Test email sent successfully!')
      setEmail('')
      onClose()
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to send test email')
    },
  })

  const handleSend = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }
    sendTestMutation.mutate(email)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="test_email" className="text-sm font-medium text-slate-700">
              Email Address
            </label>
            <Input
              id="test_email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendTestMutation.isPending}>
            {sendTestMutation.isPending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

