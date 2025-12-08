'use client'

import { useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RetryPanelProps {
  error: Error | null
  onRetry: () => void
  isRetrying?: boolean
  message?: string
}

export default function RetryPanel({ error, onRetry, isRetrying = false, message }: RetryPanelProps) {
  if (!error) return null

  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {message || 'Failed to load data'}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {error.message || 'Please try again'}
        </p>
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      </CardContent>
    </Card>
  )
}

