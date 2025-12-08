'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import WorkspaceForm from '../../components/WorkspaceForm'

export default function WorkspaceSettingsPage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Workspace Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Configure your workspace and email sending defaults
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <WorkspaceForm />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

