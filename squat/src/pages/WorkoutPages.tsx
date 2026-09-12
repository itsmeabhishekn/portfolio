import { useParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatRepTarget } from "@/lib/format";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import { cx } from "@/lib/cx";
import styles from "./pages.module.css";

async function loadSession(sessionId: string) {
  const session = await api.sessions.getSession(sessionId);
  const sessionExercises = await api.sessions.listSessionExercises(sessionId);
  const blocks = await Promise.all(
    sessionExercises.map(async (item) => {
      const [exercise, sets] = await Promise.all([
        api.exercises.getExercise(item.exerciseId),
        api.sessions.listSets(item.id),
      ]);
      return { item, exercise, sets };
    }),
  );
  return { session, blocks };
}

export function WorkoutSessionPage() {
  const { sessionId } = useParams();
  const { data, error, loading } = useAsyncValue(() => {
    if (!sessionId) {
      return Promise.reject(new Error("Missing session."));
    }
    return loadSession(sessionId);
  }, sessionId ?? "missing-session");

  if (loading) {
    return <Spinner label="Loading workout" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Workout not found."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Session"
        title={data.session.name}
        description="Template vs session are separate — this is a performed workout."
        action={
          <Badge tone={data.session.status === "completed" ? "success" : "accent"}>
            {data.session.status === "completed" ? "Done" : "Live"}
          </Badge>
        }
      />

      {data.blocks.map((block) => (
        <Card key={block.item.id}>
          <div className={styles.row}>
            <h2 className="t-exercise">{block.exercise.name}</h2>
            <span className="t-meta">{block.exercise.muscleGroup}</span>
          </div>
          <div className={styles.setList} style={{ marginTop: "1rem" }}>
            {block.sets.map((set) => (
              <div key={set.id} className={styles.setRow}>
                <span className="t-meta">{set.setNumber}</span>
                <span className="t-body">
                  {set.weightKg == null ? "—" : `${set.weightKg}`}
                  <span className={styles.muted}> kg</span>
                </span>
                <span className="t-body">
                  {set.reps == null ? "—" : set.reps}
                  <span className={styles.muted}> reps</span>
                </span>
                <span className="t-secondary">
                  {set.rpe == null ? "RPE —" : `RPE ${set.rpe}`}
                </span>
                <span
                  className={cx(
                    styles.check,
                    set.completed ? styles.setDone : styles.setOpen,
                  )}
                  aria-label={set.completed ? "Set complete" : "Set open"}
                >
                  {set.completed ? "✓" : ""}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function WorkoutTemplatePage() {
  const { workoutId } = useParams();
  const { data, error, loading } = useAsyncValue(() => {
    if (!workoutId) {
      return Promise.reject(new Error("Missing workout."));
    }
    return Promise.all([
      api.workouts.getWorkout(workoutId),
      api.workouts.listWorkoutExercises(workoutId),
    ]).then(async ([workout, items]) => {
      const details = await Promise.all(
        items.map(async (item) => ({
          item,
          exercise: await api.exercises.getExercise(item.exerciseId),
        })),
      );
      return { workout, details };
    });
  }, workoutId ?? "missing-workout");

  if (loading) {
    return <Spinner label="Loading template" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Workout not found."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Template"
        title={data.workout.name}
        description={data.workout.notes ?? "Planned workout, not a logged session."}
      />
      {data.details.map(({ item, exercise }) => (
        <Card key={item.id}>
          <h2 className="t-exercise">{exercise.name}</h2>
          <p className="t-secondary">
            {item.targetSets} × {formatRepTarget(item.targetReps)}
            {item.targetWeightKg != null ? ` · ${item.targetWeightKg} kg` : ""}
          </p>
        </Card>
      ))}
    </div>
  );
}
