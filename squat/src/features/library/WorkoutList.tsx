import { Link } from "react-router-dom";
import { Badge, Card, EmptyState } from "@/components/ui";
import { paths } from "@/config/paths";
import { formatMuscleGroupList } from "@/lib/workoutMeta";
import type { WorkoutSummary } from "@/types/domain";
import styles from "@/pages/pages.module.css";

export function WorkoutList({
  workouts,
}: {
  workouts: readonly WorkoutSummary[];
}) {
  if (workouts.length === 0) {
    return (
      <EmptyState
        title="No workouts"
        body="Workout days show up here after a program is assigned to you."
      />
    );
  }

  return (
    <div className={styles.list}>
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <div className={styles.cardBody}>
            <div className={styles.row}>
              <h2 className="t-exercise">{workout.name}</h2>
              {workout.inProgress ? <Badge tone="accent">Live</Badge> : null}
            </div>
            <p className="t-secondary">{workout.programName}</p>
            <p className="t-secondary">
              {formatMuscleGroupList(workout.muscleGroups)}
            </p>
            <p className="t-meta">
              {workout.exerciseCount}{" "}
              {workout.exerciseCount === 1 ? "exercise" : "exercises"}
              {" · "}~{workout.estimatedMinutes} min
            </p>
            <Link
              className={styles.linkish}
              to={paths.workoutTemplate(workout.id)}
            >
              Open template
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
