import { test, expect } from '@playwright/test'
import { graphql, getAuthToken } from './helpers.js'

/**
 * Exercise 11: Computed field postCount
 */
test.describe('Exercise 11: Admin computed field', () => {
  test('User has postCount field', async () => {
    const token = await getAuthToken()
    const data = await graphql(
      `query { adminUsers(limit: 5) { id username postCount } }`,
      {},
      token
    )
    expect(Array.isArray(data.adminUsers)).toBe(true)
    data.adminUsers.forEach((u) => {
      expect(typeof u.postCount).toBe('number')
      expect(u.postCount).toBeGreaterThanOrEqual(0)
    })
  })

  test('Admin page shows post count for users', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByText(/\d+.*post|\d+.*post/i).first()).toBeVisible({ timeout: 5000 })
  })
})
