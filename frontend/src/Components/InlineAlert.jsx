function InlineAlert({ message, variant = "error", onDismiss }) {
  if (!message) return null;

  return (
    <div className={`bms-inline-alert ${variant}`} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="bms-inline-alert-close" onClick={onDismiss} aria-label="Dismiss message">
          ✕
        </button>
      )}
    </div>
  );
}

export default InlineAlert;
