import { exerciseProgress, personalRecords } from "@/services/api/mock/data";
import type { ExerciseProgress, PersonalRecord } from "@/types/domain";

export function listPersonalRecords(): Promise<readonly PersonalRecord[]> {
  return Promise.resolve(personalRecords);
}

export function listExerciseProgress(): Promise<readonly ExerciseProgress[]> {
  return Promise.resolve(exerciseProgress);
}
