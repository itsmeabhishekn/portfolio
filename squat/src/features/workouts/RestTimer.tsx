import { Button } from "@/components/ui";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./active.module.css";

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface RestTimerProps {
  remainingMs: number;
  totalMs: number;
  running: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}

export function RestTimer({
  remainingMs,
  totalMs,
  running,
  onPause,
  onResume,
  onSkip,
}: RestTimerProps) {
  const reducedMotion = usePrefersReducedMotion();
  if (totalMs <= 0 || remainingMs <= 0) {
    return null;
  }

  const progress = Math.min(1, remainingMs / totalMs);

  return (
    <div className={`glass ${styles.timer}`} role="status" aria-live="polite">
      <div className={styles.timerCopy}>
        <p className="t-meta">Rest</p>
        <p className={`t-metric ${styles.timerValue}`}>
          {formatRemaining(remainingMs)}
        </p>
        <div className={styles.timerTrack} aria-hidden="true">
          <div
            className={styles.timerFill}
            style={{
              transform: `scaleX(${progress})`,
              transition: reducedMotion ? "none" : undefined,
            }}
          />
        </div>
      </div>
      <div className={styles.timerActions}>
        {running ? (
          <Button variant="secondary" size="sm" onClick={onPause}>
            Pause
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onResume}>
            Resume
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip rest
        </Button>
      </div>
    </div>
  );
}
