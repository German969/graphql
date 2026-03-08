import { useState, useEffect } from 'react'
import { getFeed, publishPost } from './services/posts'
import { createUser } from './services/users'
import './App.css'

const CURRENT_USER_KEY = 'blog-current-user'

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
  const [data, setData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [currentUser, setCurrentUserState] = useState(loadCurrentUser)
  const [showUserForm, setShowUserForm] = useState(() => !loadCurrentUser())
  const [usernameInput, setUsernameInput] = useState('')
  const [displayNameInput, setDisplayNameInput] = useState('')

  useEffect(() => {
    getFeed()
      .then((d) => {
        setData(d)
        setPosts(d.posts || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleSetCurrentUser(e) {
    e.preventDefault()
    const username = usernameInput.trim()
    const displayName = displayNameInput.trim()
    if (!username || !displayName) return
    createUser(username, displayName)
      .then((user) => {
        const u = { username: user.username, displayName: user.displayName }
        setCurrentUserState(u)
        saveCurrentUser(u)
        setShowUserForm(false)
      })
      .catch((e) => setError(e.message))
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
      setError('Set a current user (username + display name) before publishing.')
      return
    }
    try {
      const newPost = await publishPost(
        title.trim(),
        body.trim(),
        currentUser.username
      )
      setPosts((prev) => [newPost, ...prev])
      setTitle('')
      setBody('')
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p>Loading…</p>
  if (error && !data) return <p>Error: {error}</p>
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
      </section>
        </main>
      </div>
    </div>
  )
}

export default App
