'use client'

import { QueryClient } from '@tanstack/react-query'
import { handle401Error } from './interceptors'

// Create a singleton QueryClient
let queryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes default (increased from 10 seconds)
          gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors except 429
            if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
              return false
            }
            // Retry GET requests up to 2 times
            return failureCount < 2
          },
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: false,
          onError: async (error: any) => {
            if (error?.status === 401) {
              await handle401Error()
            }
          },
        },
      },
    })
  }
  return queryClient
}

