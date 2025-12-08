'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/perf/web-vitals'

export function ClientWebVitals() {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return null
}

