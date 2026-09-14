import { ApiError } from "@/services/api/client";
import type {
  Equipment,
  Exercise,
  MuscleGroup,
  PerformedSet,
  Program,
  RepTarget,
  Rpe,
  SessionExercise,
  SessionStatus,
  Workout,
  WorkoutExercise,
  WorkoutSession,
} from "@/types/domain";

const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "quads",
  "hamstrings",
  "glutes",
  "arms",
  "core",
  "full_body",
];

const EQUIPMENT: readonly Equipment[] = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "other",
];

const SESSION_STATUSES: readonly SessionStatus[] = [
  "in_progress",
  "completed",
  "abandoned",
];

const RPE_VALUES: readonly Rpe[] = [
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
];

export interface WorkoutDetail {
  workout: Workout;
  program: Program;
  items: readonly WorkoutExercise[];
  exercises: readonly Exercise[];
  muscleGroups: readonly MuscleGroup[];
  exerciseCount: number;
  estimatedMinutes: number;
  inProgress: boolean;
}

export interface SessionBlock {
  item: SessionExercise;
  exercise: Exercise;
  prescription: WorkoutExercise;
  sets: readonly PerformedSet[];
}

export interface SessionDetail {
  session: WorkoutSession;
  blocks: readonly SessionBlock[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unexpected(field: string): ApiError {
  return new ApiError(
    "The server returned an unexpected response.",
    "invalid_response",
    500,
    `Invalid field: ${field}`,
  );
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw unexpected(field);
  }
  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw unexpected(field);
  }
  return value;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw unexpected(field);
  }
  return value;
}

function asNullableNumber(value: unknown, field: string): number | null {
  if (value === null) {
    return null;
  }
  return asNumber(value, field);
}

function asBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw unexpected(field);
  }
  return value;
}

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw unexpected(field);
  }
  return value;
}

function parseUnion<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  const candidate = asString(value, field);
  const match = allowed.find((item) => item === candidate);
  if (match === undefined) {
    throw unexpected(field);
  }
  return match;
}

function asMuscleGroup(value: unknown, field: string): MuscleGroup {
  return parseUnion(value, MUSCLE_GROUPS, field);
}

function asEquipment(value: unknown, field: string): Equipment {
  return parseUnion(value, EQUIPMENT, field);
}

function asSessionStatus(value: unknown, field: string): SessionStatus {
  return parseUnion(value, SESSION_STATUSES, field);
}

function asRpe(value: unknown, field: string): Rpe | null {
  const rpe = asNullableNumber(value, field);
  if (rpe === null) {
    return null;
  }
  const match = RPE_VALUES.find((item) => item === rpe);
  if (match === undefined) {
    throw unexpected(field);
  }
  return match;
}

function toRepTarget(repMin: number, repMax: number): RepTarget {
  if (repMin === repMax) {
    return repMin;
  }
  return { min: repMin, max: repMax };
}

function parseExercise(value: unknown): Exercise {
  if (!isRecord(value)) {
    throw unexpected("exercise");
  }
  return {
    id: asString(value.id, "exercise.id"),
    name: asString(value.name, "exercise.name"),
    muscleGroup: asMuscleGroup(
      value.primaryMuscleGroup,
      "exercise.primaryMuscleGroup",
    ),
    equipment: asEquipment(value.equipment, "exercise.equipment"),
  };
}

function parseWorkoutExercise(
  value: unknown,
  workoutId: string,
): { item: WorkoutExercise; exercise: Exercise } {
  if (!isRecord(value)) {
    throw unexpected("workoutExercise");
  }
  const exercise = parseExercise(value.exercise);
  return {
    exercise,
    item: {
      id: asString(value.id, "workoutExercise.id"),
      workoutId,
      exerciseId: exercise.id,
      order: asNumber(value.order, "workoutExercise.order"),
      targetSets: asNumber(value.targetSets, "workoutExercise.targetSets"),
      targetReps: toRepTarget(
        asNumber(value.repMin, "workoutExercise.repMin"),
        asNumber(value.repMax, "workoutExercise.repMax"),
      ),
      targetWeightKg: asNullableNumber(
        value.targetWeightKg,
        "workoutExercise.targetWeightKg",
      ),
      restSeconds: asNumber(value.restSeconds, "workoutExercise.restSeconds"),
    },
  };
}

function parseProgram(value: unknown): Program {
  if (!isRecord(value)) {
    throw unexpected("program");
  }
  return {
    id: asString(value.id, "program.id"),
    userId: "",
    name: asString(value.name, "program.name"),
    description: asString(value.description, "program.description"),
    workoutIds: [],
  };
}

export function parseWorkoutDetail(value: unknown): WorkoutDetail {
  if (!isRecord(value)) {
    throw unexpected("workout");
  }
  const program = parseProgram(value.program);
  const workout: Workout = {
    id: asString(value.id, "workout.id"),
    programId: program.id,
    name: asString(value.name, "workout.name"),
    notes: asNullableString(value.notes, "workout.notes"),
  };
  if (!Array.isArray(value.exercises)) {
    throw unexpected("workout.exercises");
  }
  const rows = value.exercises.map((item) =>
    parseWorkoutExercise(item, workout.id),
  );
  const muscleGroups = asStringArray(
    value.muscleGroups,
    "workout.muscleGroups",
  ).map((group) => asMuscleGroup(group, "workout.muscleGroups"));

  return {
    workout,
    program,
    items: rows.map((row) => row.item),
    exercises: rows.map((row) => row.exercise),
    muscleGroups,
    exerciseCount: asNumber(value.exerciseCount, "workout.exerciseCount"),
    estimatedMinutes: asNumber(
      value.estimatedMinutes,
      "workout.estimatedMinutes",
    ),
    inProgress: asBoolean(value.inProgress, "workout.inProgress"),
  };
}

function parseSet(value: unknown, sessionExerciseId: string): PerformedSet {
  if (!isRecord(value)) {
    throw unexpected("set");
  }
  return {
    id: asString(value.id, "set.id"),
    sessionExerciseId,
    setNumber: asNumber(value.setNumber, "set.setNumber"),
    weightKg: asNullableNumber(value.weightKg, "set.weightKg"),
    reps: asNullableNumber(value.reps, "set.reps"),
    rpe: asRpe(value.rpe, "set.rpe"),
    completed: asBoolean(value.completed, "set.completed"),
    completedAt: asNullableString(value.completedAt, "set.completedAt"),
  };
}

function parseSessionBlock(
  value: unknown,
  sessionId: string,
  workoutId: string,
): SessionBlock {
  if (!isRecord(value)) {
    throw unexpected("sessionExercise");
  }
  const parsed = parseWorkoutExercise(value.prescription, workoutId);
  const item: SessionExercise = {
    id: asString(value.id, "sessionExercise.id"),
    sessionId,
    exerciseId: parsed.exercise.id,
    order: asNumber(value.order, "sessionExercise.order"),
  };
  if (!Array.isArray(value.sets)) {
    throw unexpected("sessionExercise.sets");
  }
  return {
    item,
    exercise: parsed.exercise,
    prescription: parsed.item,
    sets: value.sets.map((set) => parseSet(set, item.id)),
  };
}

export function parseSessionDetail(value: unknown): SessionDetail {
  if (!isRecord(value)) {
    throw unexpected("session");
  }
  const sessionId = asString(value.id, "session.id");
  const workoutId = asString(value.workoutId, "session.workoutId");
  const session: WorkoutSession = {
    id: sessionId,
    userId: "",
    workoutId,
    name: asString(value.name, "session.name"),
    status: asSessionStatus(value.status, "session.status"),
    startedAt: asString(value.startedAt, "session.startedAt"),
    completedAt: asNullableString(value.completedAt, "session.completedAt"),
    durationMinutes: null,
    notes: null,
  };
  if (!Array.isArray(value.exercises)) {
    throw unexpected("session.exercises");
  }
  return {
    session,
    blocks: value.exercises.map((item) =>
      parseSessionBlock(item, sessionId, workoutId),
    ),
  };
}
