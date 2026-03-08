import { graphql } from '../graphql'

/**
 * Fetch blog info and all posts (for initial load).
 */
export async function getFeed() {
  return graphql(`
    query BlogQuery {
      blogName
      serverTime
      posts {
        id
        title
        body
        publishedAt
        author {
          id
          username
          displayName
        }
      }
    }
  `)
}

/**
 * Publish a new post. Returns the created post.
 */
export async function publishPost(title, body, authorUsername) {
  const data = await graphql(
    `mutation PublishPost($title: String!, $body: String!, $authorUsername: String!) {
      publishPost(title: $title, body: $body, authorUsername: $authorUsername) {
        id
        title
        body
        publishedAt
        author {
          id
          username
          displayName
        }
      }
    }`,
    { title, body, authorUsername }
  )
  return data.publishPost
}
