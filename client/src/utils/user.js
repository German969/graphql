import { CURRENT_USER_KEY, AUTH_TOKEN_KEY } from '../constants.js'

export function loadCurrentUser() {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY)
    if (!raw) return null
    const { username, displayName } = JSON.parse(raw)
    return username && displayName ? { username, displayName } : null
  } catch {
    return null
  }
}

export function saveCurrentUser(user) {
  if (user) sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  else sessionStorage.removeItem(CURRENT_USER_KEY)
}

export function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  else sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(CURRENT_USER_KEY)
}
