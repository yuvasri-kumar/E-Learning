// Experiment 1: small hook that runs an async API call and tracks
// loading / error / data. Cancels stale requests when inputs change.
import { useState, useEffect, useCallback } from "react";

export default function useFetch(asyncFn, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await asyncFn(controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (err) {
        if (err.name === "AbortError") return;
        setData(null);
        setError(err.message || "Something went wrong");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { data, loading, error, retry };
}
