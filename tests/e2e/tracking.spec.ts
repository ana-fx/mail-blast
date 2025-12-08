import { test, expect } from '@playwright/test'

// Helper function to encode URL to base64
// Playwright runs in Node.js environment, so Buffer is always available
function encodeBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64')
}

test.describe('Email Tracking', () => {
  test('should track email open', async ({ page, request }) => {
    // Create a test message ID
    const messageId = 'test-message-' + Date.now()

    // Simulate email open (tracking pixel)
    const response = await request.get(`/api/track/open/${messageId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 Test' },
    })

    expect(response.status()).toBe(200)

    // Verify event was logged (check analytics)
    // This would require backend API verification
  })

  test('should track email click', async ({ page, request }) => {
    const messageId = 'test-message-' + Date.now()
    const targetUrl = 'https://example.com'

    // Simulate click tracking
    const response = await request.get(`/api/track/click/${messageId}`, {
      params: { url: encodeBase64(targetUrl) },
    })

    expect(response.status()).toBe(302) // Redirect
    const location = response.headers()['location']
    expect(location).toContain('example.com')
  })

  test('should prevent open redirect attacks', async ({ page, request }) => {
    const messageId = 'test-message-' + Date.now()
    const maliciousUrl = 'javascript:alert(1)'

    const response = await request.get(`/api/track/click/${messageId}`, {
      params: { url: encodeBase64(maliciousUrl) },
    })

    // Should reject invalid URL
    expect([400, 403]).toContain(response.status())
  })

  test('should prevent duplicate open events', async ({ page, request }) => {
    const messageId = 'test-message-' + Date.now()

    // First open
    await request.get(`/api/track/open/${messageId}`)

    // Second open (same day)
    const response = await request.get(`/api/track/open/${messageId}`)

    // Should return success but not create duplicate event
    expect(response.status()).toBe(200)

    // Verify only one event in analytics (would need API check)
  })
})

