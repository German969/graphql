function PublishPostForm({ title, body, currentUser, onTitleChange, onBodyChange, onPublish }) {
  return (
    <section className="publish-section">
      <h2>Publish a post</h2>
      <form onSubmit={onPublish} className="publish-form">
        <div className="form-field">
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Post title"
          />
        </div>
        <div className="form-field">
          <label htmlFor="post-body">Body</label>
          <textarea
            id="post-body"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Post body"
            rows={3}
          />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={!currentUser}>Publish</button>
        </div>
      </form>
    </section>
  )
}

export default PublishPostForm
