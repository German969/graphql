import { useState, useEffect } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import './App.css'

const CURRENT_USER_KEY = 'blog-current-user'

const POSTS_PAGE_SIZE = 5

const BLOG_QUERY = gql`
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

/** Get the first GraphQL error message, or the error's message. */
function getErrorMessage(err) {
  const gqlErrors = err?.graphQLErrors
  if (gqlErrors?.length) return gqlErrors[0].message
  return err?.message ?? 'Something went wrong.'
}

const FILTER_DEBOUNCE_MS = 300

function App() {
  const [authorFilter, setAuthorFilter] = useState('')
  const [debouncedAuthorFilter, setDebouncedAuthorFilter] = useState('')
  const [orderBy, setOrderBy] = useState('PUBLISHED_AT_DESC')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedAuthorFilter(authorFilter), FILTER_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [authorFilter])

  const queryVars = {
    first: POSTS_PAGE_SIZE,
    authorUsername: debouncedAuthorFilter.trim() || null,
    orderBy,
  }

  const { data, loading, error: queryError, fetchMore } = useQuery(BLOG_QUERY, {
    variables: queryVars,
  })
  const [createUserMutation, { error: createUserError }] = useMutation(CREATE_USER_MUTATION)
  const [publishPostMutation, { error: publishError }] = useMutation(PUBLISH_POST_MUTATION, {
    refetchQueries: [{ query: BLOG_QUERY, variables: queryVars }],
  })

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [currentUser, setCurrentUserState] = useState(loadCurrentUser)
  const [showUserForm, setShowUserForm] = useState(() => !loadCurrentUser())
  const [usernameInput, setUsernameInput] = useState('')
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [mutationError, setMutationError] = useState(null)

  const error =
    queryError?.message ??
    (publishError ? getErrorMessage(publishError) : null) ??
    (createUserError ? getErrorMessage(createUserError) : null) ??
    mutationError
  const connection = data?.postsConnection
  const posts = connection?.edges?.map((e) => e.node) ?? []
  const pageInfo = connection?.pageInfo

  function handleSetCurrentUser(e) {
    e.preventDefault()
    const username = usernameInput.trim()
    const displayName = displayNameInput.trim()
    setMutationError(null)
    createUserMutation({ variables: { username, displayName } })
      .then(({ data: res }) => {
        const user = res.createUser
        const u = { username: user.username, displayName: user.displayName }
        setCurrentUserState(u)
        saveCurrentUser(u)
        setShowUserForm(false)
      })
      .catch((e) => setMutationError(getErrorMessage(e)))
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
      setMutationError(getErrorMessage(err))
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
        <div className="posts-filters">
          <div className="filter-field">
            <label htmlFor="author-filter">Filter by author</label>
            <input
              id="author-filter"
              type="text"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              placeholder="Username (leave empty for all)"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="order-by">Order by</label>
            <select
              id="order-by"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="PUBLISHED_AT_DESC">Newest first</option>
              <option value="PUBLISHED_AT_ASC">Oldest first</option>
              <option value="TITLE_ASC">Title A–Z</option>
              <option value="TITLE_DESC">Title Z–A</option>
            </select>
          </div>
        </div>
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
                variables: {
                  after: pageInfo.endCursor,
                  first: POSTS_PAGE_SIZE,
                  authorUsername: debouncedAuthorFilter.trim() || null,
                  orderBy,
                },
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
