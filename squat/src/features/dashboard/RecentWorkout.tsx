import { formatRelativeDate } from "@/lib/format";
import type { WorkoutHistoryItem } from "@/types/domain";
import styles from "./dashboard.module.css";

export function RecentWorkout({
  recent,
}: {
  recent: WorkoutHistoryItem | null;
}) {
  return (
    <section className={styles.section} aria-labelledby="recent-heading">
      <p className={styles.kicker} id="recent-heading">
        Recent
      </p>
      {recent ? (
        <div className={styles.recent}>
          <div className={styles.recentTop}>
            <h2 className="t-exercise">{recent.session.name}</h2>
            <p className="t-secondary">
              {formatRelativeDate(recent.session.startedAt)}
            </p>
          </div>
          <p className="t-secondary">
            {recent.setCount} {recent.setCount === 1 ? "set" : "sets"}
            {recent.session.durationMinutes
              ? ` · ${recent.session.durationMinutes} min`
              : ""}
          </p>
        </div>
      ) : (
        <p className={styles.empty}>
          Your completed workouts will appear here.
        </p>
      )}
    </section>
  );
}
