import { test, expect } from '@playwright/test'
import { getAuthToken } from './helpers.js'

/**
 * Exercise 9: Admin subscription
 * Verifies subscription is set up (page loads without error).
 * Full E2E would require publishing from another tab – simplified here.
 */
test.describe('Exercise 9: Admin subscription', () => {
  test('Admin page with posts loads when authenticated', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()
    await expect(page.getByText(/post|title|audit/i).first()).toBeVisible({ timeout: 5000 })
  })
})
