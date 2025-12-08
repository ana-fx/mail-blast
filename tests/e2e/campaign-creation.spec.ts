import { test, expect } from '@playwright/test'

test.describe('Campaign Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@mailblast.test')
    await page.fill('input[name="password"]', 'Admin123!@#')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a campaign successfully', async ({ page }) => {
    // Navigate to campaigns
    await page.click('text=Campaigns')
    await page.waitForURL('/campaigns')

    // Click create campaign
    await page.click('text=Create Campaign')
    await page.waitForURL('/campaigns/create')

    // Step 1: Campaign Details
    await page.fill('input[name="name"]', 'E2E Test Campaign')
    await page.fill('input[name="subject"]', 'Test Subject')
    await page.fill('input[name="fromName"]', 'Test Sender')
    await page.fill('input[name="fromEmail"]', 'test@example.com')
    await page.click('text=Next')

    // Step 2: Email Content
    await page.waitForSelector('[contenteditable="true"]', { timeout: 5000 })
    const editor = page.locator('[contenteditable="true"]').first()
    await editor.fill('This is test email content for E2E testing.')
    await page.click('text=Next')

    // Step 3: Audience & Schedule
    await page.waitForSelector('select[name="listId"]', { timeout: 5000 })
    await page.selectOption('select[name="listId"]', { index: 0 })
    await page.click('text=Finish & Schedule')

    // Should redirect to campaign detail
    await page.waitForURL(/\/campaigns\/[a-z0-9-]+/, { timeout: 10000 })
    await expect(page.locator('text=E2E Test Campaign')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/campaigns/create')
    await page.click('text=Next')

    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Subject is required')).toBeVisible()
  })

  test('should save draft automatically', async ({ page }) => {
    await page.goto('/campaigns/create')
    await page.fill('input[name="name"]', 'Draft Campaign')
    await page.fill('input[name="subject"]', 'Draft Subject')

    // Navigate away
    await page.goto('/campaigns')

    // Should see draft in list
    await expect(page.locator('text=Draft Campaign')).toBeVisible()
  })

  test('should preview email', async ({ page }) => {
    await page.goto('/campaigns/create')
    await page.fill('input[name="name"]', 'Preview Test')
    await page.fill('input[name="subject"]', 'Preview Subject')
    await page.click('text=Next')

    // Fill content
    await page.waitForSelector('[contenteditable="true"]')
    await page.locator('[contenteditable="true"]').first().fill('Preview content')
    await page.click('text=Next')

    // Go back and preview
    await page.click('text=Back')
    await page.click('text=Preview Email')

    // Modal should open
    await expect(page.locator('text=Email Preview')).toBeVisible()
    await expect(page.locator('text=Preview content')).toBeVisible()
  })
})

