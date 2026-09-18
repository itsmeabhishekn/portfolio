import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/feedback/Spinner";
import { LoadError } from "@/components/feedback/LoadError";
import { EmptyState } from "@/components/ui";
import { paths } from "@/config/paths";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { useToast } from "@/hooks/useToast";
import { api } from "@/services/api";
import { ApiError, loadFailureCopy } from "@/services/api/client";
import {
  estimateWorkoutMinutes,
  muscleGroupsFromExercises,
} from "@/lib/workoutMeta";
import { UpcomingSwitcher } from "@/features/dashboard/UpcomingSwitcher";
import { ExerciseCard } from "@/features/workouts/ExerciseCard";
import { StartWorkoutButton } from "@/features/workouts/StartWorkoutButton";
import { WorkoutHeader } from "@/features/workouts/WorkoutHeader";
import type { Exercise, Workout, WorkoutExercise } from "@/types/domain";
import styles from "./template.module.css";

interface TemplateData {
  workout: Workout;
  programName: string;
  rows: readonly { item: WorkoutExercise; exercise: Exercise }[];
  inProgress: boolean;
  isUpcoming: boolean;
}

async function loadTemplate(workoutId: string): Promise<TemplateData> {
  const detail = await api.workouts.getWorkoutDetail(workoutId);
  return {
    workout: detail.workout,
    programName: detail.program.name,
    rows: detail.items.map((item) => {
      const exercise = detail.exercises.find(
        (entry) => entry.id === item.exerciseId,
      );
      if (!exercise) {
        throw new ApiError(
          "The server returned an unexpected response.",
          "invalid_response",
          500,
          `Missing exercise ${item.exerciseId}`,
        );
      }
      return { item, exercise };
    }),
    inProgress: detail.inProgress,
    isUpcoming: detail.isUpcoming,
  };
}

export function WorkoutTemplatePage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [pending, setPending] = useState(false);
  const { data, error, loading, reload } = useAsyncValue(() => {
    if (!workoutId) {
      return Promise.reject(new Error("Missing workout."));
    }
    return loadTemplate(workoutId);
  }, workoutId ?? "missing-workout");

  const start = async () => {
    if (!data || pending) {
      return;
    }

    setPending(true);
    try {
      const session = await api.sessions.startWorkout(data.workout.id);
      navigate(paths.workoutSession(session.id));
    } catch {
      pushToast("Couldn't start this workout.", "error");
      setPending(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <Skeleton width="30%" height="1rem" />
        <Skeleton width="50%" height="2rem" />
        <Skeleton height="8rem" />
        <Skeleton height="8rem" />
      </div>
    );
  }

  if (error || !data) {
    const copy = loadFailureCopy(error);
    return (
      <LoadError
        title={copy.title}
        body={copy.body}
        onRetry={reload}
      />
    );
  }

  const exercises = data.rows.map((row) => row.exercise);

  return (
    <div className={styles.page}>
      <button
        type="button"
        className={styles.back}
        aria-label="Back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <WorkoutHeader
        workout={data.workout}
        programName={data.programName}
        muscleGroups={muscleGroupsFromExercises(exercises)}
        exerciseCount={data.rows.length}
        estimatedMinutes={estimateWorkoutMinutes(
          data.rows.map((row) => row.item),
        )}
      />

      {data.rows.length === 0 ? (
        <EmptyState
          title="No exercises"
          body="This template doesn't have any exercises yet."
        />
      ) : (
        <section aria-label="Exercises">
          <p className="t-meta">Exercises</p>
          <div className={styles.list}>
            {data.rows.map(({ item, exercise }) => (
              <ExerciseCard
                key={item.id}
                order={item.order}
                exercise={exercise}
                prescription={item}
              />
            ))}
          </div>
        </section>
      )}

      {data.isUpcoming && !data.inProgress ? (
        <UpcomingSwitcher
          currentId={data.workout.id}
          onChanged={(next) => {
            if (next.workout.id !== data.workout.id) {
              navigate(paths.workoutTemplate(next.workout.id), { replace: true });
            } else {
              reload();
            }
          }}
        />
      ) : null}

      {data.rows.length > 0 ? (
        <StartWorkoutButton
          pending={pending}
          label={data.inProgress ? "Continue workout" : "Start workout"}
          onStart={() => {
            void start();
          }}
        />
      ) : null}
    </div>
  );
}
