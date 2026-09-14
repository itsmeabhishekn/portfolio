import type { PerformedSet, Rpe } from "@/types/domain";

export interface SetDraft {
  weightKg: number | null;
  reps: number | null;
  rpe: Rpe | null;
}

export const RPE_OPTIONS: readonly Rpe[] = [
  6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
];

export function canCompleteSet(draft: SetDraft): boolean {
  return (
    draft.weightKg !== null &&
    draft.weightKg >= 0 &&
    draft.reps !== null &&
    Number.isInteger(draft.reps) &&
    draft.reps >= 1
  );
}

export function draftFromSet(set: PerformedSet): SetDraft {
  return {
    weightKg: set.weightKg,
    reps: set.reps,
    rpe: set.rpe,
  };
}
