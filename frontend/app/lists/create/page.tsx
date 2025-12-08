'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import CreateListForm from '@/components/lists/CreateListForm'

export default function CreateListPage() {
  const [queryClient] = useState(new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create List</h1>
          <p className="text-slate-600 mt-1">Create a new contact list or segment</p>
        </div>

        <CreateListForm />
      </div>
    </QueryClientProvider>
  )
}

