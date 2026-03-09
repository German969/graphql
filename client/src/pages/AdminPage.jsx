import { Link } from 'react-router-dom'

/**
 * Admin Dashboard – manage users, audit posts, analytics.
 * Exercises will progressively add features here.
 */
function AdminPage() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <nav><Link to="/">Blog</Link></nav>
      </header>
      <main>
        <p>Manage users, audit posts, and view analytics.</p>
      </main>
    </div>
  )
}

export default AdminPage
