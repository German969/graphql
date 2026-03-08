import { useState, useEffect } from 'react'
import { graphql } from './graphql'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    graphql(`
      query BlogQuery {
        blogName
        serverTime
        posts {
          id
          title
          body
          publishedAt
        }
      }
    `)
      .then((d) => {
        setData(d)
        setPosts(d.posts || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handlePublishPost(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    try {
      const result = await graphql(
        `mutation PublishPost($title: String!, $body: String!) {
          publishPost(title: $title, body: $body) {
            id
            title
            body
            publishedAt
          }
        }`,
        { title: title.trim(), body: body.trim() }
      )
      setPosts((prev) => [result.publishPost, ...prev])
      setTitle('')
      setBody('')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error}</p>
  if (!data) return null

  return (
    <div className="app">
      <h1>{data.blogName}</h1>
      <p><strong>Server time:</strong> {data.serverTime}</p>

      <section>
        <h2>Publish a post</h2>
        <form onSubmit={handlePublishPost}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Post body"
            rows={3}
          />
          <button type="submit">Publish</button>
        </form>
      </section>

      <section>
        <h2>Posts</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              <p>{post.body}</p>
              <small>{post.publishedAt}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default App
