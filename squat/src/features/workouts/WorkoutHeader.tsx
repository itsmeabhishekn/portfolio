import type { MuscleGroup, Workout } from "@/types/domain";
import { formatMuscleGroupList } from "@/lib/workoutMeta";
import styles from "./template.module.css";

interface WorkoutHeaderProps {
  workout: Workout;
  programName: string;
  muscleGroups: readonly MuscleGroup[];
  exerciseCount: number;
  estimatedMinutes: number;
}

export function WorkoutHeader({
  workout,
  programName,
  muscleGroups,
  exerciseCount,
  estimatedMinutes,
}: WorkoutHeaderProps) {
  return (
    <header className={styles.header}>
      <p className="t-meta">Planned workout</p>
      <h1 className={styles.title}>{workout.name}</h1>
      <p className="t-secondary">{programName}</p>
      <p className="t-secondary">{formatMuscleGroupList(muscleGroups)}</p>
      <p className="t-secondary">
        {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
        {" · "}~{estimatedMinutes} min
      </p>
      {workout.notes ? <p className="t-secondary">{workout.notes}</p> : null}
    </header>
  );
}
