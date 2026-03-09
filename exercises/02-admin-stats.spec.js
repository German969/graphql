import { test, expect } from '@playwright/test'
import { graphql, getAuthToken } from './helpers.js'

/**
 * Exercise 2: Admin stats query
 * Uses auth token after Exercise 8 (admin requires auth).
 */
test.describe('Exercise 2: Admin stats', () => {
  test('adminStats query returns userCount and postCount', async () => {
    const token = await getAuthToken()
    const data = await graphql(`
      query {
        adminStats {
          userCount
          postCount
        }
      }
    `, {}, token)
    expect(data.adminStats).toBeDefined()
    expect(typeof data.adminStats.userCount).toBe('number')
    expect(typeof data.adminStats.postCount).toBe('number')
    expect(data.adminStats.userCount).toBeGreaterThanOrEqual(0)
    expect(data.adminStats.postCount).toBeGreaterThanOrEqual(0)
  })

  test('Admin page displays stats', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()
    // Stats should appear (numbers)
    await expect(page.getByText(/\d+/).first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/user|post/i).first()).toBeVisible()
  })
})
