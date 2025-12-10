'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => (state as any)._hasHydrated)
  const token = useAuthStore((state) => state.token)
  const [isChecking, setIsChecking] = useState(true)

  // Wait for hydration to complete
  useEffect(() => {
    if (hasHydrated) {
      setIsChecking(false)
    } else {
      // Check localStorage directly if store hasn't hydrated yet
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.state?.token) {
              setIsChecking(false)
            }
          } catch {
            setIsChecking(false)
          }
        } else {
          setIsChecking(false)
        }
      }
    }
  }, [hasHydrated])

  useEffect(() => {
    // Only redirect if hydration is complete and not authenticated
    if (!isChecking && !isAuthenticated && !token) {
      router.push('/login')
    }
  }, [isAuthenticated, token, isChecking, router])

  // Show loading while checking or hydrating
  if (isChecking || (!hasHydrated && typeof window !== 'undefined')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (!isAuthenticated && !token) {
    return null
  }

  return <>{children}</>
}

