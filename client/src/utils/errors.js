/** Get the first GraphQL error message, or the error's message. */
export function getErrorMessage(err) {
  const gqlErrors = err?.graphQLErrors
  if (gqlErrors?.length) return gqlErrors[0].message
  return err?.message ?? 'Something went wrong.'
}
