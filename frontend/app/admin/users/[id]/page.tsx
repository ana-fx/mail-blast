'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Key, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser, useUserActions } from '@/hooks/useUsers'
import { useHasPermission } from '@/hooks/useHasPermission'
import UserForm from '@/components/admin/UserForm'
import NoAccess from '@/components/admin/NoAccess'
import { UpdateUserRequest } from '@/lib/api/admin'

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = (params?.id as string) || ''
  const [queryClient] = useState(() => new QueryClient())
  const [showPassword, setShowPassword] = useState(false)

  const hasPermission = useHasPermission('users.write')
  const { data: user, isLoading } = useUser(userId)
  const { update, resetPassword, isUpdating, isResettingPassword, resetPasswordData } = useUserActions()

  const handleSubmit = (data: UpdateUserRequest) => {
    update({ id: userId, data }, {
      onSuccess: () => {
        router.push('/admin/users')
      },
    })
  }

  const handleResetPassword = () => {
    if (confirm('Reset password for this user? A new password will be generated.')) {
      resetPassword(userId)
      setShowPassword(true)
    }
  }

  if (!hasPermission) {
    return <NoAccess />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">User not found</h1>
        <Button onClick={() => router.push('/admin/users')}>Back to Users</Button>
      </div>
    )
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Edit User
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {user.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reset Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
              >
                <Key className="h-4 w-4 mr-2" />
                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
              </Button>
              {showPassword && resetPasswordData && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    New Password Generated:
                  </p>
                  <code className="text-sm font-mono bg-white dark:bg-slate-800 px-3 py-2 rounded border">
                    {resetPasswordData.password}
                  </code>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Please copy this password and share it securely with the user.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <UserForm
            initialData={{
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
            showStatus={true}
          />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

