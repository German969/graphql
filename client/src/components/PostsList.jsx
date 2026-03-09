import { formatDateTime } from '../utils/format.js'

function PostsList({ posts, pageInfo, authorFilter, orderBy, onAuthorFilterChange, onOrderChange, onLoadMore }) {
  return (
    <section className="posts-section">
      <h2>Posts</h2>
      <div className="posts-filters">
        <div className="filter-field">
          <label htmlFor="author-filter">Filter by author</label>
          <input
            id="author-filter"
            type="text"
            value={authorFilter}
            onChange={(e) => onAuthorFilterChange(e.target.value)}
            placeholder="Username (leave empty for all)"
          />
        </div>
        <div className="filter-field">
          <label htmlFor="order-by">Order by</label>
          <select id="order-by" value={orderBy} onChange={(e) => onOrderChange(e.target.value)}>
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
        <button type="button" className="load-more" onClick={onLoadMore}>
          Load more
        </button>
      )}
    </section>
  )
}

export default PostsList
