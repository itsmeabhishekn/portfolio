import { notFound } from "@/services/api/client";
import { workoutExercises, workouts } from "@/services/api/mock/data";
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
