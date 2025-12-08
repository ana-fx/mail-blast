'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Protected from '@/components/Protected'

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(new QueryClient())

  return (
    <Protected>
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </QueryClientProvider>
    </Protected>
  )
}

