# Exercise 10: Optimistic UI for Create User

**Lessons:** 14 (Cache updates and optimistic UI)

## Goal

Add optimistic UI when creating a user from the Admin form: show the new user in the list immediately, before the server responds.

## Requirements

1. **useMutation** with `optimisticResponse`:
   - When submitting create user, provide `optimisticResponse` with a temporary user
   - Use a temporary id (e.g. `optimistic-${Date.now()}`)

2. **Cache update**:
   - Use `update` to merge the optimistic user into the `adminUsers` cache
   - Or ensure the user list refetches and the optimistic entry is replaced by the real one

3. **UX**:
   - User appears in the list immediately
   - On error, remove the optimistic entry and show error

## Hints

- `optimisticResponse: { createUser: { __typename: 'User', id: 'temp-1', username, displayName } }`
- Use `update(cache, { data })` to write to cache or refetch adminUsers

## Done when

All tests in `10-admin-optimistic-ui.spec.js` pass.
