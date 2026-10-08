import { useEffect, useState } from "react";

const SLOW_AFTER_MS = 6000;

function LoadingState({ title = "Loading...", subtitle, dark = false }) {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bms-loading-screen ${dark ? "dark-bg" : ""}`} role="status" aria-live="polite">
      <div className="bms-spinner"></div>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {isSlow && (
        <p className="bms-slow-hint">
          Still working. The server runs on a free plan and can take up to a minute to wake up.
        </p>
      )}
    </div>
  );
}

export default LoadingState;
