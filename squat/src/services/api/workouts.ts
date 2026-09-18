import { apiRequest } from "@/services/api/client";
import {
  parseWorkoutDetail,
  parseWorkoutSummaryList,
  type WorkoutDetail,
} from "@/services/api/map";
import type { Workout, WorkoutExercise, WorkoutSummary } from "@/types/domain";

export type { WorkoutDetail };

export function listWorkouts(): Promise<readonly WorkoutSummary[]> {
  return apiRequest("/workouts", {
    parse: parseWorkoutSummaryList,
  });
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

export function skipUpcoming(): Promise<WorkoutDetail> {
  return apiRequest("/workouts/upcoming/skip", {
    method: "POST",
    parse: parseWorkoutDetail,
  });
}

export function chooseUpcoming(workoutId: string): Promise<WorkoutDetail> {
  return apiRequest("/workouts/upcoming/choose", {
    method: "POST",
    body: { workoutId },
    parse: parseWorkoutDetail,
  });
}
