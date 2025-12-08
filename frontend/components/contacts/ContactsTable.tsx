'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Trash2, Eye, MoreVertical, Download } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Contact } from '@/lib/api/types'
import { formatDateTime } from '@/lib/utils'
import EmptyState from '@/components/ui/empty-state'
import { Users } from 'lucide-react'
import VirtualizedList from '@/components/virtual/VirtualizedList'

interface ContactsTableProps {
  contacts: Contact[]
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  onBulkDelete?: (ids: string[]) => void
  isLoading?: boolean
}

export default function ContactsTable({
  contacts,
  onView,
  onDelete,
  onBulkDelete,
  isLoading = false,
}: ContactsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [useVirtualization, setUseVirtualization] = useState(contacts.length > 100)

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        !search ||
        contact.email.toLowerCase().includes(search.toLowerCase()) ||
        contact.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = !statusFilter || statusFilter === 'all' || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contacts, search, statusFilter])

  const getInitials = (contact: Contact) => {
    const first = contact.first_name?.[0] || ''
    const last = contact.last_name?.[0] || ''
    return (first + last).toUpperCase() || contact.email[0].toUpperCase()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8 text-slate-400" />}
        title="No contacts found"
        description="Get started by importing your first contacts"
        action={{
          label: 'Import Contacts',
          onClick: () => {
            // Trigger import dialog
          },
        }}
      />
    )
  }

  if (useVirtualization && filteredContacts.length > 50) {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search contacts"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm text-blue-900 dark:text-blue-100">
              {selectedIds.size} contact{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Virtualized List */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <VirtualizedList
            items={filteredContacts}
            renderItem={(contact, index) => (
              <div
                className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                role="row"
              >
                <Checkbox
                  checked={selectedIds.has(contact.id)}
                  onCheckedChange={(checked) => handleSelect(contact.id, checked as boolean)}
                  aria-label={`Select ${contact.email}`}
                />
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More options">
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
            )}
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search contacts"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm text-blue-900 dark:text-blue-100">
            {selectedIds.size} contact{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800 sticky top-0">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all contacts"
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lists</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={(checked) => handleSelect(contact.id, checked as boolean)}
                    aria-label={`Select ${contact.email}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(contact)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {contact.first_name || contact.last_name
                          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                          : contact.email}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  {contact.lists && contact.lists.length > 0 ? (
                    <div className="flex gap-1">
                      {contact.lists.slice(0, 2).map((list) => (
                        <Badge key={list} variant="outline" className="text-xs">
                          {list}
                        </Badge>
                      ))}
                      {contact.lists.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.lists.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDateTime(contact.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More options">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredContacts.length === 0 && (
        <EmptyState
          icon={<Users className="h-8 w-8 text-slate-400" />}
          title="No contacts match your filters"
          description="Try adjusting your search or filter criteria"
        />
      )}
    </div>
  )
}
