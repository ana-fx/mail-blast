'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface WorkflowStepTransitionProps {
  step: string
  children: ReactNode
  direction?: 'forward' | 'backward'
}

export default function WorkflowStepTransition({
  step,
  children,
  direction = 'forward',
}: WorkflowStepTransitionProps) {
  const variants = {
    forward: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    backward: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
  }

  const currentVariants = variants[direction]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={currentVariants.initial}
        animate={currentVariants.animate}
        exit={currentVariants.exit}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

