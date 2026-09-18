import { useParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { PageHeader } from "@/components/ui";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { formatEquipment, formatMuscleGroup } from "@/lib/workoutMeta";
import { api } from "@/services/api";
import styles from "./pages.module.css";

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

  const focus = data.focus ?? formatMuscleGroup(data.muscleGroup);
  const region = data.region ?? formatMuscleGroup(data.muscleGroup);
  const subtitle = [region, focus, formatEquipment(data.equipment)]
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(" · ");

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow={data.targetSubdivision ?? focus}
        title={data.name}
        description={`${subtitle}. Personal records and session history will expand here.`}
      />
    </div>
  );
}
