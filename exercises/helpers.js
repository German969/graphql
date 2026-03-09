/**
 * Shared helpers for exercise tests.
 * Use getAuthToken() for admin API calls after Exercise 8 (admin requires auth).
 */
const GRAPHQL_URL = 'http://localhost:4000/graphql'

export async function getAuthToken() {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { login(username: "alice", password: "alice") { token } }`,
    }),
  })
  const json = await res.json()
  const token = json.data?.login?.token
  if (token) return token
  const create = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { createUser(username: "alice", displayName: "Alice") { id } }`,
    }),
  })
  const createJson = await create.json()
  if (createJson.errors) return null
  const login2 = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { login(username: "alice", password: "alice") { token } }`,
    }),
  })
  const login2Json = await login2.json()
  return login2Json.data?.login?.token ?? null
}

export async function graphql(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message ?? JSON.stringify(json.errors))
  return json.data
}
