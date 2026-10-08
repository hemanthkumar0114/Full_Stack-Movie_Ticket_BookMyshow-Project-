function ErrorState({ title = "Something went wrong", message, onRetry, dark = false, children }) {
  return (
    <div className={`bms-error-screen ${dark ? "dark-bg" : ""}`} role="alert">
      <h2>⚠️ {title}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="bms-retry-btn" onClick={onRetry}>
          Try again
        </button>
      )}
      {children}
    </div>
  );
}

export default ErrorState;
