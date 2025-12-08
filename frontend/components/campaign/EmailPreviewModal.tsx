'use client'

import { useState } from 'react'
import { X, Smartphone, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { sanitizeHTML } from '@/lib/security/sanitize'

interface EmailPreviewModalProps {
  open: boolean
  onClose: () => void
  subject?: string
  fromName?: string
  fromEmail?: string
  htmlContent: string
}

export default function EmailPreviewModal({
  open,
  onClose,
  subject,
  fromName,
  fromEmail,
  htmlContent,
}: EmailPreviewModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  const sanitizedContent = sanitizeHTML(htmlContent)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Email Preview</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobile(!isMobile)}
                aria-label={isMobile ? 'Switch to desktop view' : 'Switch to mobile view'}
              >
                {isMobile ? (
                  <>
                    <Monitor className="h-4 w-4 mr-2" />
                    Desktop
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-800 p-8">
          <div
            className={`bg-white dark:bg-slate-900 mx-auto shadow-lg ${
              isMobile ? 'max-w-sm' : 'max-w-2xl'
            }`}
          >
            {/* Email Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              {subject && (
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {subject}
                </h2>
              )}
              {(fromName || fromEmail) && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  From: {fromName || ''} {fromName && fromEmail && '<'} {fromEmail || ''}
                </p>
              )}
            </div>

            {/* Email Content */}
            <div
              className="p-6 prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
