import { useEffect, useState } from "react";

export function useCountdown(totalSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const deadline = Date.now() + totalSeconds * 1000;
    const timer = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [totalSeconds]);

  return secondsLeft;
}
