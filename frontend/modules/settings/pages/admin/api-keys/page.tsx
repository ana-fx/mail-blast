'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key } from 'lucide-react'
import ApiKeyList from '../../../components/ApiKeyList'
import { useAuthStore } from '@/store/authStore'

export default function AdminApiKeysPage() {
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">API Keys</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Generate and manage API keys for programmatic access
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ApiKeyList />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

