import { useState, useEffect } from 'react'
import { graphql } from './graphql'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newText, setNewText] = useState('')

  useEffect(() => {
    graphql(`
      query {
        hello
        now
        messages
      }
    `)
      .then((d) => {
        setData(d)
        setMessages(d.messages || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddMessage(e) {
    e.preventDefault()
    if (!newText.trim()) return
    try {
      await graphql(
        `mutation AddMessage($text: String!) { addMessage(text: $text) }`,
        { text: newText.trim() }
      )
      setMessages((m) => [...m, newText.trim()])
      setNewText('')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error}</p>
  if (!data) return null

  return (
    <div className="app">
      <h1>GraphQL from React</h1>
      <p><strong>hello:</strong> {data.hello}</p>
      <p><strong>now:</strong> {data.now}</p>

      <section>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
        <form onSubmit={handleAddMessage}>
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="New message"
          />
          <button type="submit">Add</button>
        </form>
      </section>
    </div>
  )
}

export default App
