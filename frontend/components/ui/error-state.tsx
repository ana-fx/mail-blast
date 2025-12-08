'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/errors'

interface ErrorStateProps {
  error: Error | ApiError | null
  onRetry?: () => void
  title?: string
  description?: string
  className?: string
}

export default function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
  description,
  className,
}: ErrorStateProps) {
  const errorMessage = error instanceof ApiError ? error.message : error?.message || 'An unexpected error occurred'
  const statusCode = error instanceof ApiError ? error.status : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            {description || errorMessage}
          </p>
          {statusCode && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-6">
              Status Code: {statusCode}
            </p>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

