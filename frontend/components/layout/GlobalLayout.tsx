'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import SkipNavigation from '@/components/accessibility/SkipNavigation'
import { FocusRingManager } from '@/components/accessibility/FocusRing'
import LoadingState from '@/components/ui/loading-state'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <>
      <SkipNavigation />
      <FocusRingManager />
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-6 focus:outline-none"
            tabIndex={-1}
            role="main"
            aria-label="Main content"
          >
            <Suspense fallback={<LoadingState variant="skeleton" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </Suspense>
          </main>
        </div>
      </div>
    </>
  )
}

