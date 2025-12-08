'use client'

import { useQuery } from '@tanstack/react-query'
import { activityApi } from '@/lib/api/notifications'

export function useActivityLog(params?: {
  page?: number
  type?: string
  user?: string
  date_start?: string
  date_end?: string
}) {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: () => activityApi.list(params),
  })
}

