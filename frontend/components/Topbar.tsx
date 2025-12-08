'use client'

import { useAuthStore } from '@/store/authStore'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Topbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white dark:bg-slate-900 px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Welcome back, {user?.name || 'User'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <span className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

