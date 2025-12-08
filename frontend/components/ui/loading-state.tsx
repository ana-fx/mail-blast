'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  message?: string
  variant?: 'spinner' | 'skeleton' | 'minimal'
  className?: string
}

export default function LoadingState({
  message = 'Loading...',
  variant = 'spinner',
  className,
}: LoadingStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

