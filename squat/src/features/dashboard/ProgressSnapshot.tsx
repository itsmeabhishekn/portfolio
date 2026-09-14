import type { ProgressPrView } from "@/features/dashboard/loadDashboard";
import styles from "./dashboard.module.css";

export function ProgressSnapshot({
  pr,
  streak,
}: {
  pr: ProgressPrView | null;
  streak: number;
}) {
  return (
    <section className={styles.section} aria-labelledby="progress-heading">
      <p className={styles.kicker} id="progress-heading">
        Progress
      </p>
      <div className={styles.metrics}>
        <div>
          <p className="t-meta">{pr ? pr.exerciseName : "Personal record"}</p>
          {pr ? (
            <>
              <p className={styles.metricValue}>
                {pr.weightKg} kg × {pr.reps}
              </p>
              {pr.deltaKg != null && pr.deltaKg !== 0 ? (
                <p className={styles.delta}>
                  {pr.deltaKg > 0 ? "↑" : "↓"} {Math.abs(pr.deltaKg)} kg e1RM
                </p>
              ) : (
                <p className="t-secondary">Latest recorded PR</p>
              )}
            </>
          ) : (
            <p className={styles.empty}>PRs will show as you lift.</p>
          )}
        </div>
        <div>
          <p className="t-meta">Workout streak</p>
          <p className={styles.metricValue}>
            {streak} {streak === 1 ? "workout" : "workouts"}
          </p>
          <p className="t-secondary">Consecutive training days</p>
        </div>
      </div>
    </section>
  );
}
