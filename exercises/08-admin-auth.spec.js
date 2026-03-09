import { test, expect } from '@playwright/test'

const GRAPHQL_URL = 'http://localhost:4000/graphql'

async function graphql(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  return json
}

/**
 * Exercise 8: Admin requires auth
 */
test.describe('Exercise 8: Admin auth', () => {
  test('adminStats returns error when not authenticated', async () => {
    const res = await graphql(`query { adminStats { userCount postCount } }`)
    expect(res.errors).toBeDefined()
    expect(res.errors[0].message.toLowerCase()).toMatch(/auth|login|required/)
  })

  test('adminStats works when authenticated', async () => {
    const login = await graphql(
      `mutation { login(username: "alice", password: "alice") { token } }`
    )
    const token = login.data?.login?.token
    if (!token) {
      const create = await graphql(
        `mutation { createUser(username: "alice", displayName: "Alice") { id } }`
      )
      const login2 = await graphql(
        `mutation { login(username: "alice", password: "alice") { token } }`
      )
      const t = login2.data?.login?.token
      if (!t) throw new Error('Could not get token')
      const res = await graphql(`query { adminStats { userCount postCount } }`, {}, t)
      expect(res.errors).toBeUndefined()
      expect(res.data.adminStats.userCount).toBeGreaterThanOrEqual(0)
      return
    }
    const res = await graphql(`query { adminStats { userCount postCount } }`, {}, token)
    expect(res.errors).toBeUndefined()
    expect(res.data.adminStats.userCount).toBeGreaterThanOrEqual(0)
  })

  test('Unauthenticated user sees login prompt or is redirected from Admin', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.removeItem('blog-auth-token')
      sessionStorage.removeItem('blog-current-user')
    })
    await page.goto('/admin')
    await expect(
      page.getByText(/log in|login|sign in|auth required/i).or(page.getByRole('link', { name: /blog/i }))
    ).toBeVisible({ timeout: 5000 })
  })
})
