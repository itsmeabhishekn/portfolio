import { apiRequest } from "@/services/api/client";
import { parseWorkoutDetail, type WorkoutDetail } from "@/services/api/map";
import type { Workout, WorkoutExercise } from "@/types/domain";

export type { WorkoutDetail };

export function listWorkouts(): Promise<readonly Workout[]> {
  return Promise.resolve([]);
}

export async function getWorkoutDetail(
  workoutId: string,
): Promise<WorkoutDetail> {
  return apiRequest(`/workouts/${workoutId}`, {
    parse: parseWorkoutDetail,
  });
}

export async function getUpcomingWorkoutDetail(): Promise<WorkoutDetail | null> {
  return apiRequest("/workouts/upcoming", {
    parse: parseWorkoutDetail,
    notFoundValue: null,
  });
}

export async function getWorkout(workoutId: string): Promise<Workout> {
  const detail = await getWorkoutDetail(workoutId);
  return detail.workout;
}

export async function listWorkoutExercises(
  workoutId: string,
): Promise<readonly WorkoutExercise[]> {
  const detail = await getWorkoutDetail(workoutId);
  return detail.items;
}

export async function getUpcomingWorkout(): Promise<Workout | null> {
  const detail = await getUpcomingWorkoutDetail();
  return detail?.workout ?? null;
}

export async function getUpcomingWorkoutId(): Promise<string | null> {
  const workout = await getUpcomingWorkout();
  return workout?.id ?? null;
}
