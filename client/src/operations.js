import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      displayName
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!, $displayName: String) {
    login(username: $username, password: $password, displayName: $displayName) {
      token
      user {
        id
        username
        displayName
      }
    }
  }
`

export const BLOG_QUERY = gql`
  query BlogQuery($first: Int, $after: String, $authorUsername: String, $orderBy: PostOrderBy) {
    blogName
    serverTime
    postsConnection(first: $first, after: $after, authorUsername: $authorUsername, orderBy: $orderBy) {
      edges {
        node {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($username: String!, $displayName: String!) {
    createUser(username: $username, displayName: $displayName) {
      id
      username
      displayName
    }
  }
`

export const POST_PUBLISHED_SUBSCRIPTION = gql`
  subscription PostPublished {
    postPublished {
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
`

export const PUBLISH_POST_MUTATION = gql`
  mutation PublishPost($title: String!, $body: String!, $authorUsername: String!) {
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
  }
`
