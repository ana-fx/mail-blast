'use client'

import { useState, useEffect, useRef } from 'react'
import { Smartphone, Monitor } from 'lucide-react'
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
  htmlContent = '',
}: EmailPreviewModalProps) {
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const sanitizedContent = sanitizeHTML(htmlContent || '<p>No content available</p>')
  
  // Check if it's a full HTML document
  const isFullHTML = /<html|<head|<body/i.test(htmlContent)

  // Handle image loading errors
  useEffect(() => {
    if (!contentRef.current || !open) return

    const handleImageError = (e: Event) => {
      const img = e.target as HTMLImageElement
      if (img && img.tagName === 'IMG') {
        // Hide broken images
        img.style.display = 'none'
        img.setAttribute('data-error', 'true')
      }
    }

    // Add error handlers to all images
    const images = contentRef.current.querySelectorAll('img')
    images.forEach((img) => {
      img.addEventListener('error', handleImageError)
      
      // Try loading without crossorigin first (most images work this way)
      // Only set crossorigin if the image fails to load and we need to retry
      // For now, don't set crossorigin - let browser handle it naturally
      // Most image servers allow simple GET requests without CORS headers
      
      // Remove crossorigin if it was set (might be blocking some images)
      if (img.hasAttribute('crossorigin')) {
        img.removeAttribute('crossorigin')
      }
    })

    return () => {
      images.forEach((img) => {
        img.removeEventListener('error', handleImageError)
      })
    }
  }, [sanitizedContent, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 [&>button]:right-6 [&>button]:top-6"
        aria-describedby="email-preview-description"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 relative">
          <div className="flex items-center justify-between pr-10">
            <DialogTitle className="text-lg font-semibold">Email Preview</DialogTitle>
            <span id="email-preview-description" className="sr-only">
              Preview of email content with subject {subject || 'No subject'}
            </span>
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
                  From: {fromName && fromEmail ? `${fromName} <${fromEmail}>` : fromName || fromEmail}
                </p>
              )}
            </div>

            {/* Email Content */}
            <div
              ref={contentRef}
              className={`email-preview-content ${isFullHTML ? '' : 'p-6'}`}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              style={{
                minHeight: isFullHTML ? '400px' : '200px',
                ...(isFullHTML && { padding: 0 }),
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
