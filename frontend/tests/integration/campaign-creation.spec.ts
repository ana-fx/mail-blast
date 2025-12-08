import { test, expect } from '@playwright/test'

test.describe('Campaign Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
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
    await page.fill('input[name="name"]', 'Test Campaign')
    await page.fill('input[name="subject"]', 'Test Subject')
    await page.fill('input[name="fromName"]', 'Test Sender')
    await page.fill('input[name="fromEmail"]', 'test@example.com')
    await page.click('text=Next')

    // Step 2: Email Content
    await page.waitForSelector('[contenteditable="true"]')
    await page.fill('[contenteditable="true"]', 'Test email content')
    await page.click('text=Next')

    // Step 3: Audience & Schedule
    await page.selectOption('select[name="listId"]', { index: 0 })
    await page.click('text=Finish & Send Now')

    // Should redirect to campaign detail
    await page.waitForURL(/\/campaigns\/[a-z0-9-]+/)
    await expect(page.locator('text=Test Campaign')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/campaigns/create')
    await page.click('text=Next')

    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible()
  })
})

