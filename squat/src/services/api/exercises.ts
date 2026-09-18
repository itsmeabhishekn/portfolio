import { apiRequest } from "@/services/api/client";
import { parseExercise, parseExerciseList } from "@/services/api/map";
import type { Exercise } from "@/types/domain";

export async function listExercises(): Promise<readonly Exercise[]> {
  return apiRequest("/exercises", {
    parse: parseExerciseList,
  });
}

export async function getExercise(exerciseId: string): Promise<Exercise> {
  return apiRequest(`/exercises/${exerciseId}`, {
    parse: parseExercise,
  });
}
