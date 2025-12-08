'use client'

import { QueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

// Prefetch utilities for SSR/SSG
export async function prefetchCampaign(queryClient: QueryClient, id: string) {
  await queryClient.prefetchQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await apiClient.campaigns.get(id)
      return response.data
    },
  })
}

export async function prefetchDashboard(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['analytics', 'overview'],
      queryFn: async () => {
        const response = await apiClient.analytics.overview()
        return response.data
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ['campaigns'],
      queryFn: async () => {
        const response = await apiClient.campaigns.list()
        return response.data
      },
    }),
  ])
}

export async function prefetchContacts(queryClient: QueryClient, page: number = 1) {
  await queryClient.prefetchQuery({
    queryKey: ['contacts', { page }],
    queryFn: async () => {
      const response = await apiClient.contacts.list({ page })
      return response.data
    },
  })
}

export async function prefetchTemplates(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await apiClient.templates.list()
      return response.data
    },
  })
}

