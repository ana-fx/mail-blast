'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Server,
  Database,
  AlertTriangle,
  Users,
  ToggleLeft,
  Clock,
  FileText,
  Wrench,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/internal', icon: LayoutDashboard },
  { name: 'Queues & Workers', href: '/internal/queues', icon: Activity },
  { name: 'SMTP Stats', href: '/internal/smtp', icon: Server },
  { name: 'Server Health', href: '/internal/health', icon: Database },
  { name: 'Error Logs', href: '/internal/logs', icon: AlertTriangle },
  { name: 'Internal Users', href: '/internal/users', icon: Users },
  { name: 'Feature Flags', href: '/internal/flags', icon: ToggleLeft },
  { name: 'Task Scheduler', href: '/internal/scheduler', icon: Clock },
  { name: 'Audit Trail', href: '/internal/audit', icon: FileText },
  { name: 'Recovery Tools', href: '/internal/recovery', icon: Wrench },
]

export default function InternalSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-700 px-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Internal Console
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-l-4 border-blue-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer Warning */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          ⚠️ INTERNAL ONLY
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Do not share access
        </p>
      </div>
    </div>
  )
}

