import { test, expect } from '@playwright/test'
import { getAuthToken } from './helpers.js'

/**
 * Exercise 5: Paginated posts audit
 */
test.describe('Exercise 5: Admin posts audit', () => {
  test('Admin page shows posts list', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByText(/post|title|audit/i).first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('table, ul, [role="list"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('Admin page has Load more for pagination', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    const loadMore = page.getByRole('button', { name: /load more|more|next/i })
    await expect(loadMore).toBeVisible({ timeout: 5000 })
  })
})
