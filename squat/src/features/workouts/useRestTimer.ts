import { useCallback, useEffect, useState } from "react";

const TICK_MS = 200;

export function useRestTimer(): {
  remainingMs: number;
  totalMs: number;
  running: boolean;
  visible: boolean;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
} {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [pausedMs, setPausedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const sync = () => setNow(Date.now());
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    if (endAt === null) {
      return;
    }

    const id = window.setInterval(() => {
      const stamped = Date.now();
      setNow(stamped);
      if (stamped >= endAt) {
        window.clearInterval(id);
      }
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [endAt]);

  const remainingMs =
    endAt === null ? pausedMs : Math.max(0, endAt - now);
  const running = endAt !== null && remainingMs > 0;
  const visible = totalMs > 0 && remainingMs > 0;

  const start = useCallback((seconds: number) => {
    const duration = Math.max(0, Math.round(seconds) * 1000);
    if (duration === 0) {
      setEndAt(null);
      setPausedMs(0);
      setTotalMs(0);
      return;
    }
    const stamped = Date.now();
    setTotalMs(duration);
    setPausedMs(0);
    setNow(stamped);
    setEndAt(stamped + duration);
  }, []);

  const pause = useCallback(() => {
    if (endAt === null) {
      return;
    }
    setPausedMs(Math.max(0, endAt - Date.now()));
    setEndAt(null);
  }, [endAt]);

  const resume = useCallback(() => {
    if (pausedMs <= 0) {
      return;
    }
    const stamped = Date.now();
    setNow(stamped);
    setEndAt(stamped + pausedMs);
  }, [pausedMs]);

  const skip = useCallback(() => {
    setEndAt(null);
    setPausedMs(0);
    setTotalMs(0);
  }, []);

  return {
    remainingMs,
    totalMs,
    running,
    visible,
    start,
    pause,
    resume,
    skip,
  };
}
