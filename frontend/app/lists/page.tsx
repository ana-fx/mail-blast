'use client'

import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ListsTable from '@/components/lists/ListsTable'

export default function ListsPage() {
  const router = useRouter()
  const [queryClient] = useState(new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lists</h1>
            <p className="text-slate-600 mt-1">Organize your contacts into segments</p>
          </div>
          <Button onClick={() => router.push('/lists/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create List
          </Button>
        </div>

        <ListsTable />
      </div>
    </QueryClientProvider>
  )
}

