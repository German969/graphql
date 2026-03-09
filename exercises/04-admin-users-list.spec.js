import { test, expect } from '@playwright/test'
import { graphql, getAuthToken } from './helpers.js'

/**
 * Exercise 4: Admin users list with filter
 */
test.describe('Exercise 4: Admin users list', () => {
  test('adminUsers query returns users', async () => {
    const token = await getAuthToken()
    const data = await graphql(`
      query {
        adminUsers(limit: 5) {
          id
          username
          displayName
        }
      }
    `, {}, token)
    expect(Array.isArray(data.adminUsers)).toBe(true)
    data.adminUsers.forEach((u) => {
      expect(u.id).toBeDefined()
      expect(u.username).toBeDefined()
      expect(u.displayName).toBeDefined()
    })
  })

  test('adminUsers filter by usernameContains works', async () => {
    const token = await getAuthToken()
    const data = await graphql(`
      query {
        adminUsers(limit: 10, usernameContains: "zzznonexistent999")
        { id username }
      }
    `, {}, token)
    expect(data.adminUsers).toEqual([])
  })

  test('Admin page displays users list', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByText(/user|username/i).first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('table, ul, [role="list"]').first()).toBeVisible({ timeout: 5000 })
  })
})
