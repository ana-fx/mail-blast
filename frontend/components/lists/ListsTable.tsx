'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MoreVertical, Trash2, Edit, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { listsApi, type List } from '@/lib/api/lists'
import { formatDateTime } from '@/lib/utils'

export default function ListsTable() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: () => listsApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || data.lists.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            <Users className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Create your first list</h3>
          <p className="text-slate-600 mb-6">Organize your contacts into segments</p>
          <Button onClick={() => router.push('/lists/create')}>
            Create List
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">List Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Contacts</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Updated</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.lists.map((list, index) => (
                <motion.tr
                  key={list.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/lists/${list.id}`)}
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-900">{list.name}</div>
                    {list.description && (
                      <div className="text-sm text-slate-500 mt-1">{list.description}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{list.contact_count}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-500">
                      {formatDateTime(list.created_at)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-500">
                      {formatDateTime(list.updated_at)}
                    </div>
                  </td>
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/lists/${list.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm('Delete this list?')) {
                                deleteMutation.mutate(list.id)
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

