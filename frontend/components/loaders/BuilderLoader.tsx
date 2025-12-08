'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const BuilderLoader = dynamic(
  () => import('@/components/builder/BuilderCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    ),
  }
)

export default BuilderLoader

