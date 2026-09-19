import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { paths } from "@/config/paths";
import { UpcomingSwitcher } from "@/features/dashboard/UpcomingSwitcher";
import { formatMuscleGroupList } from "@/lib/workoutMeta";
import type { TodayWorkoutView } from "@/features/dashboard/loadDashboard";
import styles from "./dashboard.module.css";

export function TodayWorkout({
  today,
  onUpcomingChanged,
}: {
  today: TodayWorkoutView | null;
  onUpcomingChanged: () => void;
}) {
  const navigate = useNavigate();

  if (!today) {
    return (
      <section className={styles.section} aria-labelledby="today-heading">
        <p className={styles.kicker} id="today-heading">
          Today
        </p>
        <div className={styles.hero}>
          <h2 className={styles.heroName}>No workout planned</h2>
          <p className="t-secondary">
            You don&apos;t have a program yet, so there is nothing to train today.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate(paths.library)}
          >
            Open library
          </Button>
        </div>
      </section>
    );
  }

  const kicker =
    today.source === "in_progress"
      ? "In progress"
      : today.source === "override"
        ? "Switched for today"
        : "Today";

  return (
    <section className={styles.section} aria-labelledby="today-heading">
      <p className={styles.kicker} id="today-heading">
        {kicker}
      </p>
      <div className={styles.hero}>
        <div className={styles.heroMeta}>
          <p className="t-meta">{today.program.name}</p>
          <h2 className={styles.heroName}>{today.workout.name}</h2>
          <p className="t-secondary">
            {formatMuscleGroupList(today.muscleGroups)}
          </p>
          <p className={styles.heroStats}>
            {today.exerciseCount}{" "}
            {today.exerciseCount === 1 ? "exercise" : "exercises"}
            {" · "}~{today.estimatedMinutes} min
          </p>
          {today.source === "override" && today.queuedName ? (
            <p className="t-secondary">
              {today.queuedName} stays queued until you complete or skip it.
            </p>
          ) : null}
        </div>
        <Button
          size="lg"
          onClick={() => navigate(paths.workoutTemplate(today.workout.id))}
        >
          {today.inProgress ? "Continue workout" : "Start workout"}
        </Button>
        <UpcomingSwitcher
          currentId={today.workout.id}
          discardsSession={today.inProgress}
          onChanged={() => onUpcomingChanged()}
        />
      </div>
    </section>
  );
}
