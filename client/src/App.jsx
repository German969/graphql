import { useState } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import './App.css'

const CURRENT_USER_KEY = 'blog-current-user'

const POSTS_PAGE_SIZE = 5

const BLOG_QUERY = gql`
  query BlogQuery($first: Int, $after: String) {
    blogName
    serverTime
    postsConnection(first: $first, after: $after) {
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

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($username: String!, $displayName: String!) {
    createUser(username: $username, displayName: $displayName) {
      id
      username
      displayName
    }
  }
`

const PUBLISH_POST_MUTATION = gql`
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

function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    if (!raw) return null
    const { username, displayName } = JSON.parse(raw)
    return username && displayName ? { username, displayName } : null
  } catch {
    return null
  }
}

function saveCurrentUser(user) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(CURRENT_USER_KEY)
}

function formatDateTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function App() {
  const { data, loading, error: queryError, fetchMore } = useQuery(BLOG_QUERY, {
    variables: { first: POSTS_PAGE_SIZE },
  })
  const [createUserMutation] = useMutation(CREATE_USER_MUTATION)
  const [publishPostMutation, { error: publishError }] = useMutation(PUBLISH_POST_MUTATION, {
    refetchQueries: [{ query: BLOG_QUERY, variables: { first: POSTS_PAGE_SIZE } }],
  })

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [currentUser, setCurrentUserState] = useState(loadCurrentUser)
  const [showUserForm, setShowUserForm] = useState(() => !loadCurrentUser())
  const [usernameInput, setUsernameInput] = useState('')
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [mutationError, setMutationError] = useState(null)

  const error = queryError?.message ?? publishError?.message ?? mutationError
  const connection = data?.postsConnection
  const posts = connection?.edges?.map((e) => e.node) ?? []
  const pageInfo = connection?.pageInfo

  function handleSetCurrentUser(e) {
    e.preventDefault()
    const username = usernameInput.trim()
    const displayName = displayNameInput.trim()
    if (!username || !displayName) return
    setMutationError(null)
    createUserMutation({ variables: { username, displayName } })
      .then(({ data: res }) => {
        const user = res.createUser
        const u = { username: user.username, displayName: user.displayName }
        setCurrentUserState(u)
        saveCurrentUser(u)
        setShowUserForm(false)
      })
      .catch((e) => setMutationError(e.message))
  }

  function handleRemoveUser() {
    setCurrentUserState(null)
    saveCurrentUser(null)
    setUsernameInput('')
    setDisplayNameInput('')
    setShowUserForm(true)
  }

  function handleChangeUser() {
    setUsernameInput(currentUser?.username ?? '')
    setDisplayNameInput(currentUser?.displayName ?? '')
    setShowUserForm(true)
  }

  async function handlePublishPost(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    if (!currentUser) {
      setMutationError('Set a current user (username + display name) before publishing.')
      return
    }
    setMutationError(null)
    try {
      await publishPostMutation({
        variables: {
          title: title.trim(),
          body: body.trim(),
          authorUsername: currentUser.username,
        },
      })
      setTitle('')
      setBody('')
    } catch (err) {
      setMutationError(err.message)
    }
  }

  if (loading) return <p>Loading…</p>
  if (queryError && !data) return <p>Error: {queryError.message}</p>
  if (!data) return null

  return (
    <div className="app">
      <header className="app-header">
        <h1>{data.blogName}</h1>
        <p><strong>Server time:</strong> {formatDateTime(data.serverTime)}</p>
        {error && <p className="error-message">{error}</p>}
      </header>

      <div className="app-layout">
        <aside className="app-sidebar">
      <section className="current-user-section">
        <h2>Current user</h2>
        {currentUser && !showUserForm ? (
          <>
            <p className="current-user-display">
              Posting as <strong>{currentUser.displayName}</strong> (@{currentUser.username})
            </p>
            <div className="current-user-actions">
              <button type="button" onClick={handleChangeUser}>Change user</button>
              <button type="button" onClick={handleRemoveUser} className="btn-remove">Remove user</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSetCurrentUser} className="publish-form">
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div className="form-field">
              <label htmlFor="display-name">Display name</label>
              <input
                id="display-name"
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="Display name"
              />
            </div>
            <div className="form-actions">
              <button type="submit">Set as current user</button>
            </div>
          </form>
        )}
      </section>

      <section className="publish-section">
        <h2>Publish a post</h2>
        <form onSubmit={handlePublishPost} className="publish-form">
          <div className="form-field">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>
          <div className="form-field">
            <label htmlFor="post-body">Body</label>
            <textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Post body"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={!currentUser}>Publish</button>
          </div>
        </form>
      </section>
        </aside>

        <main className="app-main">
      <section className="posts-section">
        <h2>Posts</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              {post.author ? (
                <span className="post-author"> by {post.author.displayName}</span>
              ) : null}
              <p>{post.body}</p>
              <small>{formatDateTime(post.publishedAt)}</small>
            </li>
          ))}
        </ul>
        {pageInfo?.hasNextPage && (
          <button
            type="button"
            className="load-more"
            onClick={() =>
              fetchMore({
                variables: { after: pageInfo.endCursor, first: POSTS_PAGE_SIZE },
              })
            }
          >
            Load more
          </button>
        )}
      </section>
        </main>
      </div>
    </div>
  )
}

export default App
