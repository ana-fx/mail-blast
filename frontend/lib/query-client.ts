'use client'

import { QueryClient } from '@tanstack/react-query'

// Optimized QueryClient with caching aligned to backend TTLs
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 1000, // 10 seconds default
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 429
          if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
            return false
          }
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Per-endpoint staleTime configuration
export const queryStaleTimes = {
  analyticsOverview: 5 * 60 * 1000, // 5 minutes (matches backend)
  analyticsTimeline: 2 * 60 * 1000, // 2 minutes
  analyticsTopLinks: 10 * 60 * 1000, // 10 minutes
  campaigns: 30 * 1000, // 30 seconds
  contacts: 30 * 1000, // 30 seconds
  templates: 60 * 1000, // 1 minute
  settings: 5 * 60 * 1000, // 5 minutes
} as const

