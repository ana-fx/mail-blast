'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Campaign } from '@/lib/api/campaigns'

interface ConfirmSendModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  campaign: Campaign | null
  audienceCount?: number
  isSending?: boolean
}

export default function ConfirmSendModal({
  open,
  onClose,
  onConfirm,
  campaign,
  audienceCount,
  isSending = false,
}: ConfirmSendModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <DialogTitle>Confirm Send Campaign</DialogTitle>
              <DialogDescription className="mt-1">
                Please review before sending
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {campaign && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Subject</label>
                <p className="text-base text-slate-900 font-medium">{campaign.subject}</p>
              </div>
              {audienceCount !== undefined && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Recipients</label>
                  <p className="text-base text-slate-900">
                    {audienceCount.toLocaleString()} contacts
                  </p>
                </div>
              )}
            </>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Once sent, this campaign cannot be edited. Are you sure you want to proceed?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Confirm Send'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

