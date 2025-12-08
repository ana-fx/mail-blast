'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TemplatePreviewModalProps {
  open: boolean
  onClose: () => void
  html: string
  title?: string
}

export default function TemplatePreviewModal({
  open,
  onClose,
  html,
  title,
}: TemplatePreviewModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title || 'Template Preview'}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobile(!isMobile)}
                className="gap-2"
              >
                {isMobile ? (
                  <>
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
          <div
            className={cn(
              'mx-auto bg-white rounded-lg shadow-lg transition-all',
              isMobile ? 'w-[375px]' : 'max-w-2xl w-full'
            )}
          >
            <div
              className="prose prose-sm max-w-none p-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

