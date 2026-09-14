import { apiRequest } from "@/services/api/client";
import { parseWorkoutDetail, type WorkoutDetail } from "@/services/api/map";
import * as mock from "@/services/api/mock/runtime";
import { workouts } from "@/services/api/mock/data";
import { isMockApi } from "@/services/api/mode";
import type { Workout, WorkoutExercise } from "@/types/domain";

export type { WorkoutDetail };

export function listWorkouts(): Promise<readonly Workout[]> {
  return Promise.resolve(workouts);
}

export async function getWorkoutDetail(
  workoutId: string,
): Promise<WorkoutDetail> {
  if (isMockApi()) {
    return mock.getWorkoutDetail(workoutId);
  }
  return apiRequest(`/workouts/${workoutId}`, {
    parse: parseWorkoutDetail,
  });
}

export async function getUpcomingWorkoutDetail(): Promise<WorkoutDetail | null> {
  if (isMockApi()) {
    return mock.getUpcomingWorkoutDetail();
  }
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
