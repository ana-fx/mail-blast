'use client'

import { useEffect } from 'react'
import { trackingApi } from '@/lib/api/tracking'

interface TrackingPixelProps {
  messageId: string
  className?: string
}

export default function TrackingPixel({ messageId, className }: TrackingPixelProps) {
  useEffect(() => {
    if (messageId) {
      // Track email open
      trackingApi.trackOpen(messageId).catch(() => {
        // Silently fail - tracking should not break the page
      })
    }
  }, [messageId])

  return (
    <img
      src={`/api/track/open/${messageId}`}
      alt=""
      width={1}
      height={1}
      className={className}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  )
}

