import { test, expect } from '@playwright/test'

test.describe('Security Validation', () => {
  test('JWT should not be stored in localStorage', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@mailblast.test')
    await page.fill('input[name="password"]', 'Admin123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return Object.keys(window.localStorage)
    })
    expect(localStorage).not.toContain('token')
    expect(localStorage).not.toContain('jwt')
    expect(localStorage).not.toContain('auth')

    // Check sessionStorage
    const sessionStorage = await page.evaluate(() => {
      return Object.keys(window.sessionStorage)
    })
    expect(sessionStorage).not.toContain('token')
    expect(sessionStorage).not.toContain('jwt')
  })

  test('should prevent XSS in email content', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@mailblast.test')
    await page.fill('input[name="password"]', 'Admin123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await page.goto('/campaigns/create')
    await page.fill('input[name="name"]', 'XSS Test')
    await page.fill('input[name="subject"]', 'XSS Subject')
    await page.click('text=Next')

    // Try to inject script
    const xssPayload = '<script>alert("XSS")</script>'
    await page.locator('[contenteditable="true"]').first().fill(xssPayload)
    await page.click('text=Next')
    await page.click('text=Back')
    await page.click('text=Preview Email')

    // Script should be sanitized
    const content = await page.locator('.email-preview').textContent()
    expect(content).not.toContain('<script>')
  })

  test('should prevent open redirect attacks', async ({ page, request }) => {
    const messageId = 'test-' + Date.now()
    const maliciousUrls = [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '//evil.com',
      'file:///etc/passwd',
    ]

    for (const url of maliciousUrls) {
      const response = await request.get(`/api/track/click/${messageId}`, {
        params: { url: Buffer.from(url).toString('base64') },
      })
      expect([400, 403]).toContain(response.status())
    }
  })

  test('should enforce role-based access', async ({ page }) => {
    // Login as member
    await page.goto('/login')
    await page.fill('input[name="email"]', 'member@mailblast.test')
    await page.fill('input[name="password"]', 'Member123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Try to access admin route
    await page.goto('/admin/users')
    
    // Should be blocked
    await expect(
      page.locator('text=Access Denied').or(page.locator('text=Unauthorized'))
    ).toBeVisible({ timeout: 5000 })
  })

  test('should handle SQL injection attempts', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@mailblast.test')
    await page.fill('input[name="password"]', 'Admin123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await page.goto('/contacts')
    
    // Try SQL injection in search
    const sqlPayload = "'; DROP TABLE contacts; --"
    await page.fill('input[placeholder*="Search"]', sqlPayload)
    await page.waitForTimeout(1000)

    // Should not crash, should handle gracefully
    await expect(page.locator('body')).toBeVisible()
  })
})

