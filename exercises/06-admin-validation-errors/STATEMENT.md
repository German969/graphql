# Exercise 6: Admin Validation Errors

**Lessons:** 10 (Error handling and validation)

## Goal

Handle and display validation errors when creating users from the Admin form.

## Requirements

1. **Server** (already has validation in createUser):
   - Empty username, empty displayName, or duplicate username return `UserInputError`

2. **Client**:
   - Display error message when createUser fails
   - Show the message near the form (e.g. red text)
   - Clear the error when user submits again or edits the form

3. **Test cases**:
   - Submitting with empty username shows error
   - Submitting with empty display name shows error

## Hints

- `useMutation` returns `[mutate, { error }]` – use `error` to show message
- `getErrorMessage` from `utils/errors.js` extracts user-friendly text from Apollo errors

## Done when

All tests in `06-admin-validation-errors.spec.js` pass.
