'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseViewportPrefetchOptions {
  rootMargin?: string
  enabled?: boolean
}

export function useViewportPrefetch(
  href: string,
  options: UseViewportPrefetchOptions = {}
) {
  const router = useRouter()
  const elementRef = useRef<HTMLElement | null>(null)
  const { rootMargin = '200px', enabled = true } = options

  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            router.prefetch(href)
            observer.disconnect()
          }
        })
      },
      { rootMargin }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [href, rootMargin, enabled, router])

  return { ref: elementRef }
}

