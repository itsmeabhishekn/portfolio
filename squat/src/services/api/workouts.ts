import { notFound } from "@/services/api/client";
import { programs, workoutExercises, workouts } from "@/services/api/mock/data";
import { store } from "@/services/api/mock/store";
import type { Workout, WorkoutExercise } from "@/types/domain";

export function listWorkouts(): Promise<readonly Workout[]> {
  return Promise.resolve(workouts);
}

export function getWorkout(workoutId: string): Promise<Workout> {
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) {
    return Promise.reject(notFound("Workout", workoutId));
  }
  return Promise.resolve(workout);
}

export function listWorkoutExercises(
  workoutId: string,
): Promise<readonly WorkoutExercise[]> {
  return Promise.resolve(
    workoutExercises
      .filter((item) => item.workoutId === workoutId)
      .slice()
      .sort((a, b) => a.order - b.order),
  );
}

export function getUpcomingWorkoutId(): string | null {
  const program = programs[0];
  if (!program || program.workoutIds.length === 0) {
    return null;
  }

  const inProgress = store.sessions
    .filter((session) => session.status === "in_progress" && session.workoutId)
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  if (inProgress?.workoutId) {
    return inProgress.workoutId;
  }

  const lastCompleted = store.sessions
    .filter((session) => session.status === "completed" && session.workoutId)
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  const rotation = program.workoutIds;
  const lastIndex = lastCompleted?.workoutId
    ? rotation.indexOf(lastCompleted.workoutId)
    : -1;
  const nextId = rotation[(lastIndex + 1) % rotation.length];
  return nextId ?? null;
}

export function getUpcomingWorkout(): Promise<Workout | null> {
  const id = getUpcomingWorkoutId();
  if (!id) {
    return Promise.resolve(null);
  }
  return getWorkout(id);
}
