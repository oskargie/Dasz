import { useEffect, useRef, useCallback } from 'react';

export function useAutoRefresh(fetchFn, intervalMs, enabled = true) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const refresh = useCallback(() => fetchRef.current(), []);

  useEffect(() => {
    if (!enabled || !intervalMs) return;
    const id = setInterval(() => fetchRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  return refresh;
}
