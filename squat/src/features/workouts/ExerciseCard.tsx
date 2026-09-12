import { formatRepTarget } from "@/lib/format";
import type { Exercise, WorkoutExercise } from "@/types/domain";
import styles from "./template.module.css";

interface ExerciseCardProps {
  order: number;
  exercise: Exercise;
  prescription: WorkoutExercise;
}

export function ExerciseCard({
  order,
  exercise,
  prescription,
}: ExerciseCardProps) {
  return (
    <article className={styles.item}>
      <span className={styles.order} aria-hidden="true">
        {order}
      </span>
      <div>
        <h2 className="t-exercise">
          <span className="sr-only">Exercise {order}. </span>
          {exercise.name}
        </h2>
        <p className={styles.sets}>
          {prescription.targetSets}{" "}
          {prescription.targetSets === 1 ? "set" : "sets"}
          {" · "}
          {formatRepTarget(prescription.targetReps)}
        </p>
      </div>
    </article>
  );
}
