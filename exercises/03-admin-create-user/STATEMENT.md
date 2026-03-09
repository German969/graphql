# Exercise 3: Create User from Admin

**Lessons:** 3 (Mutations), 4 (Variables and fragments)

## Goal

Add a form on the Admin page to create new users using the existing `createUser` mutation with variables.

## Requirements

1. **Form** on the Admin page with:
   - Username (required)
   - Display name (required)
   - Submit button

2. **Mutation** using `useMutation` with `createUser`:
   - Use variables: `{ username, displayName }`
   - On success: clear form and optionally show success message or refresh user list

3. **Error handling**:
   - Display validation errors (e.g. duplicate username) to the user

## Hints

- Use the existing `createUser` mutation from `operations.js` or define it in the Admin page
- Use `useMutation(CREATE_USER_MUTATION)` with `variables: { username, displayName }`
- Trim inputs before submitting

## Done when

All tests in `03-admin-create-user.spec.js` pass.
