'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface WorkflowProgressProps {
  steps: Array<{ id: string; label: string }>
  currentStep: string
  completedSteps?: string[]
}

export default function WorkflowProgress({
  steps,
  currentStep,
  completedSteps = [],
}: WorkflowProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex
          const isCurrent = step.id === currentStep

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green-600 border-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={`text-xs text-center ${
                  isCurrent
                    ? 'font-medium text-blue-600 dark:text-blue-400'
                    : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

