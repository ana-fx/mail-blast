import { test, expect } from '@playwright/test'

test.describe('Role-Based Access Control', () => {
  test('admin should see all features', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Should see admin menu
    await expect(page.locator('text=Admin')).toBeVisible()
    await expect(page.locator('text=User Management')).toBeVisible()
  })

  test('regular user should not see admin features', async ({ page }) => {
    // Login as regular user
    await page.goto('/login')
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'user123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Should not see admin menu
    await expect(page.locator('text=Admin')).not.toBeVisible()

    // Try to access admin route directly
    await page.goto('/admin/users')
    await expect(page.locator('text=Access Denied')).toBeVisible()
  })
})

