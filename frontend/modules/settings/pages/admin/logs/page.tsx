'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import SystemLogs from '../../../components/SystemLogs'
import { useAuthStore } from '@/store/authStore'

export default function AdminLogsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
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

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">System Logs</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and monitor system activity and events
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SystemLogs />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

