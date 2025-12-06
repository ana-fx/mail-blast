import { useState, useEffect } from 'react'
import * as analyticsAPI from '@/lib/api/analytics'
import type { OverviewStats, TimelineStat, TopLink, EmailEventsResponse } from '@/lib/api/analytics'

export function useOverview() {
  const [data, setData] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await analyticsAPI.getOverview()
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

export function useTimeline(range: string = '7d') {
  const [data, setData] = useState<TimelineStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await analyticsAPI.getTimeline(range)
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

export function useTopLinks(limit: number = 10) {
  const [data, setData] = useState<TopLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await analyticsAPI.getTopLinks(limit)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [limit])

  return { data, loading, error }
}

export function useEmailEvents(messageId: string | null) {
  const [data, setData] = useState<EmailEventsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!messageId) {
      setData(null)
      return
    }

    async function fetchData() {
      try {
        setLoading(true)
        const result = await analyticsAPI.getEmailEvents(messageId)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [messageId])

  return { data, loading, error }
}

