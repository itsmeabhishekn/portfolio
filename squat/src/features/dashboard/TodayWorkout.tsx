import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { paths } from "@/config/paths";
import { formatMuscleGroupList } from "@/lib/workoutMeta";
import type { TodayWorkoutView } from "@/features/dashboard/loadDashboard";
import styles from "./dashboard.module.css";

export function TodayWorkout({ today }: { today: TodayWorkoutView | null }) {
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
            You don&apos;t have a workout scheduled yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="today-heading">
      <p className={styles.kicker} id="today-heading">
        Today
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
        </div>
        <Button
          size="lg"
          onClick={() => navigate(paths.workoutTemplate(today.workout.id))}
        >
          {today.inProgress ? "Continue workout" : "Start workout"}
        </Button>
      </div>
    </section>
  );
}
