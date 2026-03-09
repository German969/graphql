import { test, expect } from '@playwright/test'
import { getAuthToken } from './helpers.js'

/**
 * Exercise 10: Optimistic UI for create user
 * Verifies create user still works; optimistic UI is a UX improvement.
 */
test.describe('Exercise 10: Admin optimistic UI', () => {
  test('Create user form still works', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    const unique = `optuser${Date.now()}`
    await page.getByRole('textbox', { name: /username/i }).fill(unique)
    await page.getByRole('textbox', { name: /display/i }).fill('Optimistic User')
    await page.getByRole('button', { name: /create|add|submit/i }).click()
    await expect(page.getByText(unique)).toBeVisible({ timeout: 5000 })
  })
})
