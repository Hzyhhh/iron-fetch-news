import { useState, useEffect, useCallback } from "react";

export function useCountdown(intervalMs: number) {
  const total = Math.floor(intervalMs / 1000);
  const [countdown, setCountdown] = useState(total);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? total : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [total]);

  const reset = useCallback(() => setCountdown(total), [total]);

  return { countdown, reset };
}
