import { graphql } from '../graphql'

/**
 * Create or update a user by username. Returns the user.
 */
export async function createUser(username, displayName) {
  const data = await graphql(
    `mutation CreateUser($username: String!, $displayName: String!) {
      createUser(username: $username, displayName: $displayName) {
        id
        username
        displayName
      }
    }`,
    { username, displayName }
  )
  return data.createUser
}
