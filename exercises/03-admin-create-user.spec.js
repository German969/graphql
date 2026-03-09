import { test, expect } from '@playwright/test'
import { getAuthToken } from './helpers.js'

const GRAPHQL_URL = 'http://localhost:4000/graphql'

async function graphql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  return json
}

/**
 * Exercise 3: Create user from admin
 */
test.describe('Exercise 3: Admin create user', () => {
  test('Admin page has create user form', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    await page.goto('/admin')
    await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /display/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /create|add|submit/i })).toBeVisible()
  })

  test('Submitting form creates user with variables', async ({ page }) => {
    const token = await getAuthToken()
    await page.goto('/')
    await page.evaluate((t) => sessionStorage.setItem('blog-auth-token', t), token)
    const unique = `adminuser${Date.now()}`
    await page.goto('/admin')
    await page.getByRole('textbox', { name: /username/i }).fill(unique)
    await page.getByRole('textbox', { name: /display/i }).fill('Admin Test User')
    await page.getByRole('button', { name: /create|add|submit/i }).click()

    await expect(page.getByText(/success|created|added/i)).toBeVisible({ timeout: 5000 })
    const { data } = await graphql(
      `query { user(username: $u) { username displayName } }`,
      { u: unique }
    )
    expect(data.user).toBeDefined()
    expect(data.user.username).toBe(unique)
  })
})
