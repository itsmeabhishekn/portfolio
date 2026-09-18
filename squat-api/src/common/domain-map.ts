import { Prisma } from '@prisma/client';
import type {
  Equipment,
  MuscleGroup,
  WorkoutSessionStatus,
} from '@prisma/client';

export type ApiMuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'arms'
  | 'core'
  | 'full_body';

export type ApiEquipment =
  'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other';

export type ApiSessionStatus = 'in_progress' | 'completed' | 'abandoned';

const MUSCLE_TO_API: Record<MuscleGroup, ApiMuscleGroup> = {
  CHEST: 'chest',
  BACK: 'back',
  SHOULDERS: 'shoulders',
  QUADS: 'quads',
  HAMSTRINGS: 'hamstrings',
  GLUTES: 'glutes',
  ARMS: 'arms',
  CORE: 'core',
  FULL_BODY: 'full_body',
};

const EQUIPMENT_TO_API: Record<Equipment, ApiEquipment> = {
  BARBELL: 'barbell',
  DUMBBELL: 'dumbbell',
  MACHINE: 'machine',
  CABLE: 'cable',
  BODYWEIGHT: 'bodyweight',
  OTHER: 'other',
};

const STATUS_TO_API: Record<WorkoutSessionStatus, ApiSessionStatus> = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

const API_TO_MUSCLE = {
  chest: 'CHEST',
  back: 'BACK',
  shoulders: 'SHOULDERS',
  quads: 'QUADS',
  hamstrings: 'HAMSTRINGS',
  glutes: 'GLUTES',
  arms: 'ARMS',
  core: 'CORE',
  full_body: 'FULL_BODY',
} as const satisfies Record<ApiMuscleGroup, MuscleGroup>;

const API_TO_EQUIPMENT = {
  barbell: 'BARBELL',
  dumbbell: 'DUMBBELL',
  machine: 'MACHINE',
  cable: 'CABLE',
  bodyweight: 'BODYWEIGHT',
  other: 'OTHER',
} as const satisfies Record<ApiEquipment, Equipment>;

export function toApiMuscleGroup(value: MuscleGroup): ApiMuscleGroup {
  return MUSCLE_TO_API[value];
}

export function toApiEquipment(value: Equipment): ApiEquipment {
  return EQUIPMENT_TO_API[value];
}

export function isApiMuscleGroup(value: string): value is ApiMuscleGroup {
  return Object.hasOwn(API_TO_MUSCLE, value);
}

export function isApiEquipment(value: string): value is ApiEquipment {
  return Object.hasOwn(API_TO_EQUIPMENT, value);
}

export function fromApiMuscleGroup(value: ApiMuscleGroup): MuscleGroup {
  return API_TO_MUSCLE[value];
}

export function fromApiEquipment(value: ApiEquipment): Equipment {
  return API_TO_EQUIPMENT[value];
}

export function toApiSessionStatus(
  value: WorkoutSessionStatus,
): ApiSessionStatus {
  return STATUS_TO_API[value];
}

export function decimalToNumber(
  value: Prisma.Decimal | number | null,
): number | null {
  if (value === null) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  return value.toNumber();
}

export function uniqueMuscleGroups(
  groups: readonly ApiMuscleGroup[],
): ApiMuscleGroup[] {
  const seen = new Set<ApiMuscleGroup>();
  const ordered: ApiMuscleGroup[] = [];
  for (const group of groups) {
    if (!seen.has(group)) {
      seen.add(group);
      ordered.push(group);
    }
  }
  return ordered;
}

export function estimateWorkoutMinutes(
  items: readonly { targetSets: number; restSeconds: number }[],
): number {
  const workSecondsPerSet = 40;
  const seconds = items.reduce((sum, item) => {
    return sum + item.targetSets * (item.restSeconds + workSecondsPerSet);
  }, 0);
  return Math.max(1, Math.round(seconds / 60));
}
