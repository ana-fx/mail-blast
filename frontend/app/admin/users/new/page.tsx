'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUserActions } from '@/hooks/useUsers'
import { useHasPermission } from '@/hooks/useHasPermission'
import UserForm from '@/components/admin/UserForm'
import NoAccess from '@/components/admin/NoAccess'
import { CreateUserRequest } from '@/lib/api/admin'

export default function NewUserPage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const { create, isCreating } = useUserActions()
  const hasPermission = useHasPermission('users.write')

  const handleSubmit = (data: CreateUserRequest) => {
    create(data, {
      onSuccess: (user) => {
        router.push(`/admin/users/${user.id}`)
      },
    })
  }

  if (!hasPermission) {
    return <NoAccess />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/users')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Create New User
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Add a new user to the system
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <UserForm onSubmit={handleSubmit} isSubmitting={isCreating} />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

