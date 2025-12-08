'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, Calendar, CheckCircle, XCircle, MousePointerClick, Eye } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { type Contact } from '@/lib/api/contacts'
import { contactsApi } from '@/lib/api/contacts'
import { formatDateTime } from '@/lib/utils'

interface ContactDetailSidebarProps {
  contact: Contact
  open: boolean
  onClose: () => void
}

export default function ContactDetailSidebar({ contact, open, onClose }: ContactDetailSidebarProps) {
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['contact-events', contact.id],
    queryFn: () => contactsApi.getEvents(contact.id),
    enabled: open,
  })

  const { data: lists, isLoading: listsLoading } = useQuery({
    queryKey: ['contact-lists', contact.id],
    queryFn: () => contactsApi.getLists(contact.id),
    enabled: open,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'bounced':
        return 'bg-red-100 text-red-800'
      case 'complaint':
        return 'bg-orange-100 text-orange-800'
      case 'unsubscribed':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'open':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'click':
        return <MousePointerClick className="h-4 w-4 text-purple-600" />
      case 'sent':
        return <Mail className="h-4 w-4 text-green-600" />
      case 'bounce':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-slate-600" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 text-lg">
              <AvatarFallback>
                {((contact.first_name || contact.last_name
                  ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                  : contact.email)
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2))}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>
                {contact.first_name || contact.last_name
                  ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                  : 'No name'}
              </SheetTitle>
              <p className="text-sm text-slate-600 mt-1">{contact.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(contact.status)}`}>
            {contact.status}
          </span>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Email</label>
                  <p className="text-sm text-slate-900 mt-1">{contact.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Created</label>
                  <p className="text-sm text-slate-900 mt-1">{formatDateTime(contact.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Last Activity</label>
                  <p className="text-sm text-slate-900 mt-1">
                    {events && events.length > 0
                      ? formatDateTime(events[0].created_at)
                      : 'No activity'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-4">
            {eventsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-2">
                {events.map((event: any, index: number) => (
                  <motion.div
                    key={event.id || index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getEventIcon(event.event_type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900 capitalize">
                                {event.event_type}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDateTime(event.created_at)}
                              </p>
                            </div>
                            {event.campaign_name && (
                              <p className="text-xs text-slate-600 mt-1">
                                Campaign: {event.campaign_name}
                              </p>
                            )}
                            {event.meta?.url && (
                              <p className="text-xs text-slate-600 mt-1">
                                URL: {event.meta.url}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-slate-500">No events found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lists" className="space-y-4 mt-4">
            {listsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lists && lists.length > 0 ? (
              <div className="space-y-2">
                {lists.map((list: any) => (
                  <Card key={list.id}>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-slate-900">{list.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-slate-500">Not in any lists</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

