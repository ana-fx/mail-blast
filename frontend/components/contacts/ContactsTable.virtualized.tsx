'use client'

import { useMemo } from 'react'
import { Search, Filter, Trash2, Eye, MoreVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import VirtualizedList from '@/components/virtual/VirtualizedList'
import { Contact } from '@/lib/api/types'
import { formatDateTime } from '@/lib/utils'

interface ContactsTableVirtualizedProps {
  contacts: Contact[]
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export default function ContactsTableVirtualized({
  contacts,
  onView,
  onDelete,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ContactsTableVirtualizedProps) {
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        !search ||
        contact.email.toLowerCase().includes(search.toLowerCase()) ||
        contact.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = !statusFilter || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contacts, search, statusFilter])

  const getInitials = (contact: Contact) => {
    const first = contact.first_name?.[0] || ''
    const last = contact.last_name?.[0] || ''
    return (first + last).toUpperCase() || contact.email[0].toUpperCase()
  }

  const renderContact = (contact: Contact, index: number) => {
    return (
      <div
        className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        role="row"
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(contact)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {contact.first_name || contact.last_name
              ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
              : contact.email}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {contact.email}
          </p>
        </div>
        <Badge
          variant={
            contact.status === 'active'
              ? 'default'
              : contact.status === 'bounced'
              ? 'destructive'
              : 'outline'
          }
        >
          {contact.status}
        </Badge>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {formatDateTime(contact.created_at)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(contact.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(contact.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search contacts"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Virtualized List */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <VirtualizedList
          items={filteredContacts}
          renderItem={renderContact}
          itemHeight={80}
          containerHeight={600}
          overscan={5}
        />
      </div>

      {/* Footer */}
      <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>
    </div>
  )
}

