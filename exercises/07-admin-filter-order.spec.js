import { test, expect } from '@playwright/test'
import { getAuthToken } from './helpers.js'

/**
 * Exercise 7: Admin filter and order
 */
test.describe('Exercise 7: Admin filter and order', () => {
  test('Admin posts section has filter input', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByPlaceholder(/author|filter|search/i).or(page.getByLabel(/author|filter/i))).toBeVisible({ timeout: 5000 })
  })

  test('Admin posts section has order control', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByRole('combobox').or(page.getByText(/sort|order/i))).toBeVisible({ timeout: 5000 })
  })
})
