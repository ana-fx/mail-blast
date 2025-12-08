import { useState, useEffect } from 'react'
import { analyticsApi } from '@/lib/api/analytics'
import type { AnalyticsOverview, TimelineData } from '@/lib/api/analytics'

export function useOverview() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await analyticsApi.getOverview()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

export function useTimeline(range: '7d' | '30d' | '90d' = '30d') {
  const [data, setData] = useState<TimelineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await analyticsApi.getTimeline(range)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [range])

  return { data, loading, error }
}


