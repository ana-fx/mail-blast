'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { Plus, Trash2 } from 'lucide-react'
import { listsApi } from '@/lib/api/lists'
import { contactsApi } from '@/lib/api/contacts'
import AddContactsToListDialog from '@/components/lists/AddContactsToListDialog'
import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : ''
  const [showAddDialog, setShowAddDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ['list', listId],
    queryFn: () => listsApi.get(listId),
    enabled: !!listId,
  })

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['lists', listId, 'contacts'],
    queryFn: () => listsApi.getContacts(listId),
    enabled: !!listId,
  })

  const removeMutation = useMutation({
    mutationFn: (contactId: string) => listsApi.removeContact(listId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['list', listId] })
    },
  })

  if (listLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">List not found</h1>
        <Button onClick={() => router.push('/lists')}>Back to Lists</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{list.name}</h1>
          {list.description && (
            <p className="text-slate-600 mt-1">{list.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {contactsData?.total || 0} contact{contactsData?.total !== 1 ? 's' : ''}
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contacts
            </Button>
          </div>

          {contactsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : contactsData && contactsData.contacts.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactsData.contacts.map((contact: any) => (
                        <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email}
                              />
                              <div>
                                <div className="font-medium text-slate-900">
                                  {contact.first_name || contact.last_name
                                    ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                                    : 'No name'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-slate-600">{contact.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              {contact.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Remove this contact from the list?')) {
                                    removeMutation.mutate(contact.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-slate-600 mb-4">No contacts in this list</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contacts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>List Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">List Name</label>
                <p className="text-slate-900 mt-1">{list.name}</p>
              </div>
              {list.description && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <p className="text-slate-900 mt-1">{list.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700">Created</label>
                <p className="text-slate-900 mt-1">{formatDateTime(list.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Updated</label>
                <p className="text-slate-900 mt-1">{formatDateTime(list.updated_at)}</p>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
                      listsApi.delete(listId).then(() => {
                        router.push('/lists')
                      })
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete List
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showAddDialog && (
        <AddContactsToListDialog
          listId={listId}
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  )
}

