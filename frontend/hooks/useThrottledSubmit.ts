'use client'

import { useCallback, useRef } from 'react'
import { throttle } from '@/lib/security/throttle'

interface UseThrottledSubmitOptions {
  delay?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useThrottledSubmit<T>(
  submitFn: (data: T) => Promise<void>,
  options: UseThrottledSubmitOptions = {}
) {
  const { delay = 1000, onSuccess, onError } = options
  const isSubmittingRef = useRef(false)

  const throttledSubmit = useCallback(
    throttle(async (data: T) => {
      if (isSubmittingRef.current) return

      try {
        isSubmittingRef.current = true
        await submitFn(data)
        onSuccess?.()
      } catch (error) {
        onError?.(error as Error)
      } finally {
        isSubmittingRef.current = false
      }
    }, delay),
    [submitFn, delay, onSuccess, onError]
  )

  return {
    submit: throttledSubmit,
    isSubmitting: isSubmittingRef.current,
  }
}

