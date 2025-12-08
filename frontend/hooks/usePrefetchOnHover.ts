'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UsePrefetchOnHoverOptions {
  delay?: number
  enabled?: boolean
}

export function usePrefetchOnHover(
  href: string,
  options: UsePrefetchOnHoverOptions = {}
) {
  const router = useRouter()
  const timerRef = useRef<number | null>(null)
  const { delay = 120, enabled = true } = options

  const onMouseEnter = () => {
    if (!enabled) return

    timerRef.current = window.setTimeout(() => {
      router.prefetch(href)
    }, delay)
  }

  const onMouseLeave = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return {
    onMouseEnter,
    onMouseLeave,
  }
}

