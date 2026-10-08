import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync(asyncFn, deps = [], { keepPreviousData = false } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState({ key: null, data: null, error: null });
  const latestFn = useRef(asyncFn);

  useEffect(() => {
    latestFn.current = asyncFn;
  });

  const requestKey = JSON.stringify([...deps, attempt]);

  useEffect(() => {
    let cancelled = false;

    latestFn.current()
      .then((data) => {
        if (!cancelled) setSettled({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        if (!cancelled) setSettled({ key: requestKey, data: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const retry = useCallback(() => setAttempt((count) => count + 1), [setAttempt]);
  const loading = settled.key !== requestKey;

  const showSettled = !loading || keepPreviousData;

  return {
    data: showSettled ? settled.data : null,
    error: showSettled ? settled.error : null,
    loading,
    retry
  };
}
