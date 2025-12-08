'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/errors'

interface ApiErrorAlertProps {
  error: ApiError | Error | null
  onRetry?: () => void
  title?: string
}

export default function ApiErrorAlert({ error, onRetry, title = 'Something went wrong' }: ApiErrorAlertProps) {
  if (!error) return null

  const message = error instanceof ApiError ? error.message : error.message || 'An error occurred'
  const status = error instanceof ApiError ? error.status : undefined

  return (
    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">{title}</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">{message}</p>
            {status && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">Status Code: {status}</p>
            )}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

