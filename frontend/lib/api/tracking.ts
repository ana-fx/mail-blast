'use client'

import { httpClient } from './http'
import type { ApiResponse } from './types'

// Tracking API endpoints
export const trackingApi = {
  // Track email open (pixel)
  trackOpen: async (messageId: string): Promise<void> => {
    await httpClient.get(`/track/open/${messageId}`, {
      skipAuth: true,
      timeout: 5000, // Short timeout for tracking
    })
  },

  // Track email click (redirect)
  trackClick: async (messageId: string, url: string): Promise<string> => {
    // URL should be base64 encoded by backend
    const response = await httpClient.get<{ redirect_url: string }>(
      `/track/click/${messageId}?url=${encodeURIComponent(url)}`,
      {
        skipAuth: true,
        timeout: 5000,
      }
    )
    return response.data.redirect_url
  },
}

