'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createQueryClient } from '@/lib/query-client'
import GlobalLayout from '@/components/layout/GlobalLayout'
import Protected from '@/components/Protected'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <Protected>
      <QueryClientProvider client={queryClient}>
        <GlobalLayout>{children}</GlobalLayout>
      </QueryClientProvider>
    </Protected>
  )
}

