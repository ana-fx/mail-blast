'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkflowNavigationProps {
  onNext: () => void
  onBack: () => void
  onCancel?: () => void
  canNext: boolean
  canBack: boolean
  isNextLoading?: boolean
  nextLabel?: string
  backLabel?: string
}

export default function WorkflowNavigation({
  onNext,
  onBack,
  onCancel,
  canNext,
  canBack,
  isNextLoading = false,
  nextLabel = 'Next',
  backLabel = 'Back',
}: WorkflowNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700"
    >
      <div className="flex gap-2">
        {canBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
        )}
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
      <Button
        onClick={onNext}
        disabled={!canNext || isNextLoading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isNextLoading ? (
          'Loading...'
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  )
}

