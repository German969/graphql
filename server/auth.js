/**
 * Simple token encoding/decoding for learning. Not cryptographically secure.
 * Token format: base64(JSON.stringify({ username, exp }))
 * "Password" is simply: must equal username for this demo.
 */

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export function encodeToken(username) {
  const payload = { username, exp: Date.now() + TOKEN_EXPIRY_MS };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload && payload.username && payload.exp > Date.now()) {
      return { username: payload.username };
    }
  } catch {}
  return null;
}

/** For this demo: "password" must equal username. */
export function validatePassword(username, password) {
  return password != null && String(password).trim() === String(username).trim();
}
