'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const FlowCanvasLoader = dynamic(
  () => import('@/components/automation/FlowCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  }
)

export default FlowCanvasLoader

