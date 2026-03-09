import { test, expect } from '@playwright/test'
import { getAuthToken } from './helpers.js'

/**
 * Exercise 6: Admin validation errors
 */
test.describe('Exercise 6: Admin validation errors', () => {
  test('Empty username shows error', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await page.getByRole('textbox', { name: /username/i }).fill('')
    await page.getByRole('textbox', { name: /display/i }).fill('Some Name')
    await page.getByRole('button', { name: /create|add|submit/i }).click()
    await expect(page.getByText(/required|username|error|invalid/i)).toBeVisible({ timeout: 3000 })
  })

  test('Empty display name shows error', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await page.getByRole('textbox', { name: /username/i }).fill(`user${Date.now()}`)
    await page.getByRole('textbox', { name: /display/i }).fill('')
    await page.getByRole('button', { name: /create|add|submit/i }).click()
    await expect(page.getByText(/required|display|error|invalid/i)).toBeVisible({ timeout: 5000 })
  })
})
