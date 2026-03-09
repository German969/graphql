function CurrentUserSection({
  currentUser,
  showUserForm,
  usernameInput,
  displayNameInput,
  onUsernameChange,
  onDisplayNameChange,
  onSetUser,
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
            <button type="button" onClick={onRemoveUser} className="btn-remove">Remove user</button>
          </div>
        </>
      ) : (
        <form onSubmit={onSetUser} className="publish-form">
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
            <label htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              type="text"
              value={displayNameInput}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Display name"
            />
          </div>
          <div className="form-actions">
            <button type="submit">Set as current user</button>
          </div>
        </form>
      )}
    </section>
  )
}

export default CurrentUserSection
