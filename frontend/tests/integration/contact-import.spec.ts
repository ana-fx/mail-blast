import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Contact Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should import contacts from CSV', async ({ page }) => {
    await page.goto('/contacts')
    await page.click('text=Import CSV')

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    const csvPath = path.join(__dirname, '../fixtures/contacts.csv')
    await fileInput.setInputFiles(csvPath)

    // Map fields
    await page.selectOption('select[name="email"]', { index: 0 })
    await page.selectOption('select[name="firstName"]', { index: 1 })
    await page.selectOption('select[name="lastName"]', { index: 2 })

    // Confirm import
    await page.click('text=Import Contacts')

    // Should show success message
    await expect(page.locator('text=Contacts imported successfully')).toBeVisible()
  })
})

