import { Link, useParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Card, PageHeader } from "@/components/ui";
import { paths } from "@/config/paths";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./pages.module.css";

export function ExercisesPage() {
  const { data, error, loading } = useAsyncValue(() => api.exercises.listExercises());

  if (loading) {
    return <Spinner label="Loading exercises" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Could not load exercises."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow="Library" title="Exercises" />
      {data.map((exercise) => (
        <Card key={exercise.id}>
          <h2 className="t-exercise">{exercise.name}</h2>
          <p className="t-secondary">
            {exercise.muscleGroup} · {exercise.equipment}
          </p>
          <Link className={styles.linkish} to={paths.exercise(exercise.id)}>
            History
          </Link>
        </Card>
      ))}
    </div>
  );
}

export function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const { data, error, loading } = useAsyncValue(() => {
    if (!exerciseId) {
      return Promise.reject(new Error("Missing exercise."));
    }
    return api.exercises.getExercise(exerciseId);
  }, exerciseId ?? "missing-exercise");

  if (loading) {
    return <Spinner label="Loading exercise" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Exercise not found."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow={data.equipment}
        title={data.name}
        description={`${data.muscleGroup} · personal records and session history will expand here.`}
      />
    </div>
  );
}
