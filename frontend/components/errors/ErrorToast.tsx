'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/errors'

interface ErrorToastProps {
  error: ApiError | Error | null
  onDismiss: () => void
  duration?: number
}

export default function ErrorToast({ error, onDismiss, duration = 5000 }: ErrorToastProps) {
  useEffect(() => {
    if (error && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [error, duration, onDismiss])

  if (!error) return null

  const message = error instanceof ApiError ? error.message : error.message || 'An error occurred'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

