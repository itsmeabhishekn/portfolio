import { notFound } from "@/services/api/client";
import { exercises } from "@/services/api/mock/data";
import type { Exercise } from "@/types/domain";

export function listExercises(): Promise<readonly Exercise[]> {
  return Promise.resolve(exercises);
}

export function getExercise(exerciseId: string): Promise<Exercise> {
  const exercise = exercises.find((item) => item.id === exerciseId);
  if (!exercise) {
    return Promise.reject(notFound("Exercise", exerciseId));
  }
  return Promise.resolve(exercise);
}
