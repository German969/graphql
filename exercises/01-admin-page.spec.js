import { test, expect } from '@playwright/test'

/**
 * Exercise 1: Admin page and routing
 * Requires server (4000) and client (5173) running.
 */
test.describe('Exercise 1: Admin page and routing', () => {
  test('Blog page has Admin link', async ({ page }) => {
    await page.goto('/')
    const adminLink = page.getByRole('link', { name: /admin/i })
    await expect(adminLink).toBeVisible()
    await expect(adminLink).toHaveAttribute('href', '/admin')
  })

  test('Admin page loads and shows heading', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()
  })

  test('Admin page has link back to Blog', async ({ page }) => {
    await page.goto('/admin')
    const blogLink = page.getByRole('link', { name: /blog/i })
    await expect(blogLink).toBeVisible()
    await expect(blogLink).toHaveAttribute('href', '/')
  })

  test('Can navigate Blog → Admin → Blog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /admin/i }).click()
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible()

    await page.getByRole('link', { name: /blog/i }).click()
    await expect(page).toHaveURL(/\/(\?.*)?$/)
    await expect(page.getByText(/posts|blog|feed/i).first()).toBeVisible()
  })
})
