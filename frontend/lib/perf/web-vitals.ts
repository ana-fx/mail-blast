'use client'

import { onCLS, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

export interface WebVitalsReport {
  name: string
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
}

let vitalsReported = false

function sendToAnalytics(metric: Metric) {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
  }

  // Send to API endpoint
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      keepalive: true,
    }).catch(() => {
      // Silently fail if metrics endpoint is not available
    })
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', report)
  }
}

export function reportWebVitals() {
  if (vitalsReported) return
  vitalsReported = true

  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onINP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

// Custom performance trace hook
export function usePerfTrace(name: string) {
  if (typeof window === 'undefined') return

  const start = performance.now()

  return {
    end: () => {
      const duration = performance.now() - start
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Perf Trace] ${name}: ${duration.toFixed(2)}ms`)
      }
      return duration
    },
    mark: (label: string) => {
      performance.mark(`${name}-${label}`)
    },
  }
}

