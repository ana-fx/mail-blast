'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Shield, Key, FileText, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const settingsMenu = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Personal information and preferences',
    icon: User,
    href: '/settings/profile',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'workspace',
    title: 'Workspace',
    description: 'Workspace configuration and defaults',
    icon: Building2,
    href: '/settings/workspace',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
]

const adminMenu = [
  {
    id: 'users',
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    icon: Shield,
    href: '/settings/admin/users',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Generate and manage API keys',
    icon: Key,
    href: '/settings/admin/api-keys',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    id: 'logs',
    title: 'System Logs',
    description: 'View system activity and events',
    icon: FileText,
    href: '/settings/admin/logs',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800',
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Settings className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your account and workspace settings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">General</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {settingsMenu.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all border-slate-200 dark:border-slate-700"
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${item.bgColor}`}>
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Admin Menu */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Admin Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminMenu.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all border-slate-200 dark:border-slate-700"
                    onClick={() => router.push(item.href)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${item.bgColor}`}>
                          <Icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
