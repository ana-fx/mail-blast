'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          {icon && (
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                {icon}
              </div>
            </div>
          )}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {description}
            </p>
          )}
          {action && (
            <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700">
              {action.label}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

