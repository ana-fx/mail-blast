'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Settings, Users, Key, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHasPermission } from '@/hooks/useHasPermission'

const menuItems = [
  {
    id: 'system',
    label: 'System Settings',
    icon: Settings,
    path: '/settings/system',
    permission: 'settings.update',
  },
  {
    id: 'team',
    label: 'Team Settings',
    icon: Users,
    path: '/settings/team',
    permission: 'settings.read',
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    icon: Key,
    path: '/settings/api-keys',
    permission: 'settings.update',
  },
]

export default function SettingsSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <div className="space-y-1">
        {menuItems.map((item) => {
          const hasPermission = useHasPermission(item.permission)
          if (!hasPermission) return null

          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

