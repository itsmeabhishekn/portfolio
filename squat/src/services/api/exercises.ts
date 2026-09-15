import { notFound } from "@/services/api/client";
import type { Exercise } from "@/types/domain";

export function listExercises(): Promise<readonly Exercise[]> {
  return Promise.resolve([]);
}

export function getExercise(exerciseId: string): Promise<Exercise> {
  return Promise.reject(notFound("Exercise", exerciseId));
}
