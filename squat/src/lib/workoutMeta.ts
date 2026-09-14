import type { Exercise, MuscleGroup, WorkoutExercise } from "@/types/domain";

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  arms: "Arms",
  core: "Core",
  full_body: "Full body",
};

const WORK_SECONDS_PER_SET = 40;

export function formatMuscleGroup(group: MuscleGroup): string {
  return MUSCLE_LABELS[group];
}

export function uniqueMuscleGroups(
  groups: readonly MuscleGroup[],
): MuscleGroup[] {
  const seen = new Set<MuscleGroup>();
  const ordered: MuscleGroup[] = [];
  for (const group of groups) {
    if (!seen.has(group)) {
      seen.add(group);
      ordered.push(group);
    }
  }
  return ordered;
}

export function muscleGroupsFromExercises(
  items: readonly Exercise[],
): MuscleGroup[] {
  return uniqueMuscleGroups(items.map((item) => item.muscleGroup));
}

export function formatMuscleGroupList(groups: readonly MuscleGroup[]): string {
  return groups.map(formatMuscleGroup).join(" · ");
}

export function estimateWorkoutMinutes(
  items: readonly WorkoutExercise[],
): number {
  const seconds = items.reduce((sum, item) => {
    return sum + item.targetSets * (item.restSeconds + WORK_SECONDS_PER_SET);
  }, 0);
  return Math.max(1, Math.round(seconds / 60));
}

export function completedWorkoutStreak(
  startedAtDates: readonly string[],
): number {
  const days = [
    ...new Set(
      startedAtDates.map((iso) => {
        const date = new Date(iso);
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${date.getUTCFullYear()}-${month}-${day}`;
      }),
    ),
  ].sort();

  const latest = days.at(-1);
  if (!latest) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(`${latest}T00:00:00.000Z`);

  while (days.includes(toUtcDay(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function toUtcDay(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}
