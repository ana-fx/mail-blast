'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/lib/api/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !token && !user) {
      router.push(redirectTo)
    }
  }, [token, user, isLoading, router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    )
  }

  if (!token && !user) {
    return null
  }

  return <>{children}</>
}

