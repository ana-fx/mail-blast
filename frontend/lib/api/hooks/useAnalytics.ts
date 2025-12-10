'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { AnalyticsOverview, TimelinePoint } from '../types'

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await apiClient.analytics.overview()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAnalyticsTimeline(range: '7d' | '30d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['analytics', 'timeline', range],
    queryFn: async () => {
      const response = await apiClient.analytics.timeline(range)
      // Ensure we return an array, not undefined
      return response.data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTopLinks(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-links', limit],
    queryFn: async () => {
      const response = await apiClient.analytics.topLinks(limit)
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useRecentEvents(limit: number = 25) {
  return useQuery({
    queryKey: ['analytics', 'recent-events', limit],
    queryFn: async () => {
      const response = await apiClient.analytics.recentEvents(limit)
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10000, // Poll every 10 seconds
  })
}

