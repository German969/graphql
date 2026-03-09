import { CURRENT_USER_KEY, AUTH_TOKEN_KEY } from '../constants.js'

export function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    if (!raw) return null
    const { username, displayName } = JSON.parse(raw)
    return username && displayName ? { username, displayName } : null
  } catch {
    return null
  }
}

export function saveCurrentUser(user) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(CURRENT_USER_KEY)
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_KEY)
}
