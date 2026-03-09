import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import './App.css'
import { POSTS_PAGE_SIZE, FILTER_DEBOUNCE_MS } from './constants.js'
import { BLOG_QUERY, CREATE_USER_MUTATION, PUBLISH_POST_MUTATION } from './operations.js'
import { loadCurrentUser, saveCurrentUser } from './utils/user.js'
import { formatDateTime } from './utils/format.js'
import { getErrorMessage } from './utils/errors.js'
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
          <CurrentUserSection
            currentUser={currentUser}
            showUserForm={showUserForm}
            usernameInput={usernameInput}
            displayNameInput={displayNameInput}
            onUsernameChange={setUsernameInput}
            onDisplayNameChange={setDisplayNameInput}
            onSetUser={handleSetCurrentUser}
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
