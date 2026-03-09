# Exercise 8: Admin Requires Auth

**Lessons:** 12 (Context)

## Goal

Require the user to be logged in to access the Admin page. Use `context.user` on the server.

## Requirements

### Server

1. **adminStats** and **adminUsers** resolvers:
   - Check `context.user` – if null/undefined, throw an error (e.g. `ForbiddenError` or `Authentication required`)
   - Only return data when user is authenticated

2. **Error**:
   - Use a clear message like "Authentication required for admin."

### Client

3. **Admin page**:
   - If not logged in, redirect to `/` (Blog) or show "Log in to access Admin"
   - Use `useQuery(ME_QUERY)` or similar to check auth state
   - Optionally: show login prompt on Admin page instead of redirect

## Hints

- `context.user` is set from the JWT in the `Authorization` header
- Use `me` query to check if user is logged in (client stores token)
- Redirect with `useNavigate` from react-router-dom

## Done when

All tests in `08-admin-auth.spec.js` pass.
