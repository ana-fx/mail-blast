'use client'

import { useState } from 'react'
import { useQuery, useQueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import ContactsTable from '@/components/contacts/ContactsTable'
import ImportCsvDialog from '@/components/contacts/ImportCsvDialog'
import ContactDetailSidebar from '@/components/contacts/ContactDetailSidebar'
import { contactsApi, type Contact } from '@/lib/api/contacts'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'

export default function ContactsPage() {
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: contactsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.list(),
  })

  const { data: selectedContact } = useQuery({
    queryKey: ['contacts', selectedContactId],
    queryFn: () => contactsApi.get(selectedContactId!),
    enabled: !!selectedContactId,
  })

  const handleViewContact = (id: string) => {
    setSelectedContactId(id)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Contacts</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your contact list</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {isLoading && <LoadingState variant="skeleton" />}
        {error && <ErrorState error={error as Error} onRetry={() => refetch()} />}
        {contactsResponse && (
          <ContactsTable
            contacts={contactsResponse.contacts || []}
            onView={handleViewContact}
          />
        )}

        {showImportDialog && (
          <ImportCsvDialog
            open={showImportDialog}
            onClose={() => setShowImportDialog(false)}
          />
        )}

        {selectedContact && (
          <ContactDetailSidebar
            contact={selectedContact}
            open={!!selectedContact}
            onClose={() => setSelectedContactId(null)}
          />
        )}
      </div>
    </QueryClientProvider>
  )
}

