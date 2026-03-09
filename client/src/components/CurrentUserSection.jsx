function CurrentUserSection({
  currentUser,
  showUserForm,
  usernameInput,
  passwordInput,
  displayNameInput,
  onUsernameChange,
  onPasswordChange,
  onDisplayNameChange,
  onLogin,
  onRemoveUser,
  onChangeUser,
}) {
  return (
    <section className="current-user-section">
      <h2>Current user</h2>
      {currentUser && !showUserForm ? (
        <>
          <p className="current-user-display">
            Posting as <strong>{currentUser.displayName}</strong> (@{currentUser.username})
          </p>
          <div className="current-user-actions">
            <button type="button" onClick={onChangeUser}>Change user</button>
            <button type="button" onClick={onRemoveUser} className="btn-remove">Log out</button>
          </div>
        </>
      ) : (
        <form onSubmit={onLogin} className="publish-form">
          <p className="form-hint">Password must equal username (demo auth).</p>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={usernameInput}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="Username"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={passwordInput}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Same as username"
            />
          </div>
          <div className="form-field">
            <label htmlFor="display-name">Display name (for new users)</label>
            <input
              id="display-name"
              type="text"
              value={displayNameInput}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Optional when existing"
            />
          </div>
          <div className="form-actions">
            <button type="submit">Login</button>
          </div>
        </form>
      )}
    </section>
  )
}

export default CurrentUserSection
