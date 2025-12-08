'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ProfileForm from '../../components/ProfileForm'
import PasswordForm from '../../components/PasswordForm'
import NotificationPreferences from '../../components/NotificationPreferences'

export default function ProfileSettingsPage() {
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your personal information and preferences
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ProfileForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-6"
          >
            <PasswordForm />
            <NotificationPreferences />
          </motion.div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

