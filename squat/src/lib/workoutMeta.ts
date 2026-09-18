import type { Equipment, Exercise, MuscleGroup, WorkoutExercise } from "@/types/domain";

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  adductors: "Adductors",
  calves: "Calves",
  arms: "Arms",
  core: "Core",
  full_body: "Full body",
};

const WORK_SECONDS_PER_SET = 40;

export function formatMuscleGroup(group: MuscleGroup): string {
  return MUSCLE_LABELS[group];
}

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  machine: "Machine",
  cable: "Cable",
  bodyweight: "Bodyweight",
  other: "Other",
};

export function formatEquipment(equipment: Equipment): string {
  return EQUIPMENT_LABELS[equipment];
}

const REGION_ORDER = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
] as const;

export interface ExerciseFocusGroup {
  focus: string;
  exercises: readonly Exercise[];
}

export interface ExerciseRegionGroup {
  region: string;
  groups: readonly ExerciseFocusGroup[];
}

export function groupExercisesByRegion(
  exercises: readonly Exercise[],
): ExerciseRegionGroup[] {
  const regions = new Map<string, Map<string, Exercise[]>>();

  for (const exercise of exercises) {
    const region = exercise.region ?? formatMuscleGroup(exercise.muscleGroup);
    const focus = exercise.focus ?? formatMuscleGroup(exercise.muscleGroup);
    let focuses = regions.get(region);
    if (!focuses) {
      focuses = new Map();
      regions.set(region, focuses);
    }
    const bucket = focuses.get(focus);
    if (bucket) {
      bucket.push(exercise);
    } else {
      focuses.set(focus, [exercise]);
    }
  }

  const names = [...regions.keys()].sort((left, right) => {
    const leftRank = REGION_ORDER.indexOf(
      left as (typeof REGION_ORDER)[number],
    );
    const rightRank = REGION_ORDER.indexOf(
      right as (typeof REGION_ORDER)[number],
    );
    const leftOrder = leftRank === -1 ? REGION_ORDER.length : leftRank;
    const rightOrder = rightRank === -1 ? REGION_ORDER.length : rightRank;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.localeCompare(right);
  });

  return names.map((region) => {
    const focuses = regions.get(region);
    return {
      region,
      groups: [...(focuses?.entries() ?? [])].map(([focus, items]) => ({
        focus,
        exercises: items,
      })),
    };
  });
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
