import { useState, useEffect } from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import './App.css'
import { POSTS_PAGE_SIZE, FILTER_DEBOUNCE_MS } from './constants.js'
import {
  BLOG_QUERY,
  LOGIN_MUTATION,
  PUBLISH_POST_MUTATION,
  POST_PUBLISHED_SUBSCRIPTION,
} from './operations.js'
import { loadCurrentUser, saveCurrentUser, setAuthToken, clearAuth } from './utils/user.js'
import { formatDateTime } from './utils/format.js'
import { getErrorMessage } from './utils/errors.js'
import { prependPostToConnection } from './utils/cache.js'
import CurrentUserSection from './components/CurrentUserSection.jsx'
import PublishPostForm from './components/PublishPostForm.jsx'
import PostsList from './components/PostsList.jsx'

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

  const [currentUser, setCurrentUserState] = useState(loadCurrentUser)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const { data, loading, error: queryError, fetchMore, refetch } = useQuery(BLOG_QUERY, {
    variables: queryVars,
  })
  useSubscription(POST_PUBLISHED_SUBSCRIPTION, {
    skip: !currentUser,
    onData: () => refetch(),
  })
  const [loginMutation, { error: loginError }] = useMutation(LOGIN_MUTATION)
  const [publishPostMutation, { error: publishError }] = useMutation(PUBLISH_POST_MUTATION, {
    update(cache, { data }) {
      const newPost = data?.publishPost
      if (newPost) prependPostToConnection(cache, newPost, queryVars)
    },
  })

  const [showUserForm, setShowUserForm] = useState(() => !loadCurrentUser())
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [mutationError, setMutationError] = useState(null)

  const error =
    queryError?.message ??
    (publishError ? getErrorMessage(publishError) : null) ??
    (loginError ? getErrorMessage(loginError) : null) ??
    mutationError
  const connection = data?.postsConnection
  const posts = connection?.edges?.map((e) => e.node) ?? []
  const pageInfo = connection?.pageInfo

  function handleLogin(e) {
    e.preventDefault()
    const username = usernameInput.trim()
    const password = passwordInput
    const displayName = displayNameInput.trim() || null
    setMutationError(null)
    loginMutation({ variables: { username, password, displayName } })
      .then(({ data: res }) => {
        const { token, user } = res.login
        setAuthToken(token)
        const u = { username: user.username, displayName: user.displayName }
        setCurrentUserState(u)
        saveCurrentUser(u)
        setShowUserForm(false)
        setPasswordInput('')
      })
      .catch((e) => setMutationError(getErrorMessage(e)))
  }

  function handleRemoveUser() {
    clearAuth()
    setCurrentUserState(null)
    setUsernameInput('')
    setPasswordInput('')
    setDisplayNameInput('')
    setShowUserForm(true)
  }

  function handleChangeUser() {
    setUsernameInput(currentUser?.username ?? '')
    setPasswordInput('')
    setDisplayNameInput(currentUser?.displayName ?? '')
    setShowUserForm(true)
  }

  async function handlePublishPost(e) {
    e.preventDefault()
    if (!currentUser) {
      setMutationError('Log in before publishing.')
      return
    }
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()
    setMutationError(null)
    try {
      await publishPostMutation({
        variables: {
          title: trimmedTitle,
          body: trimmedBody,
          authorUsername: currentUser.username,
        },
        optimisticResponse: {
          publishPost: {
            __typename: 'Post',
            id: `optimistic-${Date.now()}`,
            title: trimmedTitle,
            body: trimmedBody,
            publishedAt: new Date().toISOString(),
            author: {
              __typename: 'User',
              id: currentUser.id ?? 'temp',
              username: currentUser.username,
              displayName: currentUser.displayName,
            },
          },
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
          <CurrentUserSection
            currentUser={currentUser}
            showUserForm={showUserForm}
            usernameInput={usernameInput}
            passwordInput={passwordInput}
            displayNameInput={displayNameInput}
            onUsernameChange={setUsernameInput}
            onPasswordChange={setPasswordInput}
            onDisplayNameChange={setDisplayNameInput}
            onLogin={handleLogin}
            onRemoveUser={handleRemoveUser}
            onChangeUser={handleChangeUser}
          />
          <PublishPostForm
            title={title}
            body={body}
            currentUser={currentUser}
            onTitleChange={setTitle}
            onBodyChange={setBody}
            onPublish={handlePublishPost}
          />
        </aside>

        <main className="app-main">
          <PostsList
            posts={posts}
            pageInfo={pageInfo}
            authorFilter={authorFilter}
            orderBy={orderBy}
            onAuthorFilterChange={setAuthorFilter}
            onOrderChange={setOrderBy}
            onLoadMore={() =>
              fetchMore({
                variables: {
                  after: pageInfo.endCursor,
                  first: POSTS_PAGE_SIZE,
                  authorUsername: debouncedAuthorFilter.trim() || null,
                  orderBy,
                },
              })
            }
          />
        </main>
      </div>
    </div>
  )
}

export default App
