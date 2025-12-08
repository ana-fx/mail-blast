'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'

export function useSystemLogs(page: number = 1, level?: 'INFO' | 'WARN' | 'ERROR') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'logs', page, level],
    queryFn: () => adminApi.getLogs(page, level),
  })

  return {
    logs: data?.logs || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    isLoading,
    error,
  }
}

