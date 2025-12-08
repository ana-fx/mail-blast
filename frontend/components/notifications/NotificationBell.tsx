'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useUnreadCount } from '@/hooks/useNotifications'
import NotificationList from './NotificationList'
import { cn } from '@/lib/utils'

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useUnreadCount()
  const unreadCount = data?.count || 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs',
                unreadCount > 99 && 'w-auto px-1'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/notifications')}
            >
              View All
            </Button>
          </div>
        </SheetHeader>
        <NotificationList onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

