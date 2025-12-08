'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { contactsApi } from '@/lib/api/contacts'
import { listsApi } from '@/lib/api/lists'

interface AddContactsToListDialogProps {
  listId: string
  open: boolean
  onClose: () => void
}

export default function AddContactsToListDialog({
  listId,
  open,
  onClose,
}: AddContactsToListDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', { search, limit: 50 }],
    queryFn: () => contactsApi.list({ search, limit: 50 }),
    enabled: open,
  })

  const addMutation = useMutation({
    mutationFn: (contactIds: string[]) => listsApi.addContacts(listId, contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      setSelectedContacts([])
      onClose()
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to add contacts')
    },
  })

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const handleAdd = () => {
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact')
      return
    }
    addMutation.mutate(selectedContacts)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contacts to List</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedContacts.length > 0 && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
            </div>
          )}

          <div className="border border-slate-200 rounded-lg max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : contacts && contacts.contacts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {contacts.contacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => toggleContact(contact.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                      className="rounded border-slate-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Avatar>
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
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {contact.first_name || contact.last_name
                          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                          : 'No name'}
                      </div>
                      <div className="text-sm text-slate-600">{contact.email}</div>
                    </div>
                    {selectedContacts.includes(contact.id) && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No contacts found
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selectedContacts.length === 0 || addMutation.isPending}>
            {addMutation.isPending ? 'Adding...' : `Add ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

