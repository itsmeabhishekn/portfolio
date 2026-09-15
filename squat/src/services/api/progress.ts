import type { ExerciseProgress, PersonalRecord } from "@/types/domain";

export function listPersonalRecords(): Promise<readonly PersonalRecord[]> {
  return Promise.resolve([]);
}

export function listExerciseProgress(): Promise<readonly ExerciseProgress[]> {
  return Promise.resolve([]);
}
