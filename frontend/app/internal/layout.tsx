'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import InternalSidebar from '@/components/internal/InternalSidebar'

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <InternalSidebar />
        <div className="flex-1 overflow-y-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

