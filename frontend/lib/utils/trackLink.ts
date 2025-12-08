'use client'

import { trackingApi } from '@/lib/api/tracking'
import { isValidURL } from '@/lib/security/sanitize'

/**
 * Wraps a URL with tracking redirect
 * @param messageId Email message ID
 * @param url Original URL
 * @returns Tracking URL or original URL if invalid
 */
export async function trackLink(messageId: string, url: string): Promise<string> {
  if (!isValidURL(url)) {
    console.warn('Invalid URL for tracking:', url)
    return url
  }

  try {
    return await trackingApi.trackClick(messageId, url)
  } catch (error) {
    console.error('Failed to track link:', error)
    // Return original URL on error
    return url
  }
}

/**
 * Creates a tracking link handler
 */
export function createTrackingLinkHandler(messageId: string) {
  return async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = e.currentTarget.href
    if (!url || !isValidURL(url)) {
      return
    }

    e.preventDefault()
    const trackingUrl = await trackLink(messageId, url)
    window.location.href = trackingUrl
  }
}

