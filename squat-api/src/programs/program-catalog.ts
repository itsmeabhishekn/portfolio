import { readFileSync } from 'node:fs';
import {
  isApiEquipment,
  isApiMuscleGroup,
  type ApiEquipment,
  type ApiMuscleGroup,
} from '../common/domain-map.js';

export class CatalogParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogParseError';
  }
}

export interface CatalogExercise {
  name: string;
  description: string | null;
  primaryMuscleGroup: ApiMuscleGroup;
  secondaryMuscleGroups: ApiMuscleGroup[];
  equipment: ApiEquipment;
}

export interface CatalogWorkoutExercise {
  exerciseName: string;
  order: number;
  targetSets: number;
  repMin: number;
  repMax: number;
  targetWeightKg: number | null;
  restSeconds: number;
}

export interface CatalogWorkout {
  name: string;
  notes: string | null;
  order: number;
  exercises: CatalogWorkoutExercise[];
}

export interface CatalogProgram {
  name: string;
  description: string;
  isActive: boolean;
  workouts: CatalogWorkout[];
}

export interface ProgramCatalog {
  exercises: CatalogExercise[];
  program: CatalogProgram;
}

export function loadProgramCatalog(filePath: string): ProgramCatalog {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      throw new CatalogParseError(`Invalid JSON in ${filePath}`);
    }
    throw error;
  }
  return parseProgramCatalog(parsed);
}

export function parseProgramCatalog(value: unknown): ProgramCatalog {
  const record = asObject(value, 'catalog');
  assertKeys(record, ['exercises', 'program'], 'catalog');

  const exercises = parseExercises(record.exercises);
  const names = new Set(exercises.map((item) => item.name));
  return {
    exercises,
    program: parseProgram(record.program, names),
  };
}

function parseExercises(value: unknown): CatalogExercise[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CatalogParseError('exercises must be a non-empty array');
  }

  const exercises = value.map((item, index) =>
    parseExercise(item, `exercises[${index}]`),
  );
  const seen = new Set<string>();
  for (const exercise of exercises) {
    if (seen.has(exercise.name)) {
      throw new CatalogParseError(
        `exercises contains duplicate name "${exercise.name}"`,
      );
    }
    seen.add(exercise.name);
  }
  return exercises;
}

function parseExercise(value: unknown, path: string): CatalogExercise {
  const record = asObject(value, path);
  assertKeys(
    record,
    [
      'name',
      'description',
      'primaryMuscleGroup',
      'secondaryMuscleGroups',
      'equipment',
    ],
    path,
  );

  const name = asNonEmptyString(record.name, `${path}.name`);
  const primaryMuscleGroup = asMuscleGroup(
    record.primaryMuscleGroup,
    `${path}.primaryMuscleGroup`,
  );
  const equipment = asEquipment(record.equipment, `${path}.equipment`);
  const secondaryMuscleGroups = asMuscleGroupList(
    record.secondaryMuscleGroups,
    `${path}.secondaryMuscleGroups`,
  );

  if (secondaryMuscleGroups.includes(primaryMuscleGroup)) {
    throw new CatalogParseError(
      `${path}.secondaryMuscleGroups must not repeat the primary muscle group`,
    );
  }

  return {
    name,
    description: asNullableString(record.description, `${path}.description`),
    primaryMuscleGroup,
    secondaryMuscleGroups,
    equipment,
  };
}

function parseProgram(
  value: unknown,
  exerciseNames: Set<string>,
): CatalogProgram {
  const record = asObject(value, 'program');
  assertKeys(
    record,
    ['name', 'description', 'isActive', 'workouts'],
    'program',
  );

  return {
    name: asNonEmptyString(record.name, 'program.name'),
    description: asNonEmptyString(record.description, 'program.description'),
    isActive: asBoolean(record.isActive, 'program.isActive'),
    workouts: parseWorkouts(record.workouts, exerciseNames),
  };
}

function parseWorkouts(
  value: unknown,
  exerciseNames: Set<string>,
): CatalogWorkout[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CatalogParseError('program.workouts must be a non-empty array');
  }

  const workouts = value.map((item, index) =>
    parseWorkout(item, `program.workouts[${index}]`, exerciseNames),
  );
  assertUniqueOrders(
    workouts.map((item) => item.order),
    'program.workouts',
  );
  return workouts;
}

function parseWorkout(
  value: unknown,
  path: string,
  exerciseNames: Set<string>,
): CatalogWorkout {
  const record = asObject(value, path);
  assertKeys(record, ['name', 'notes', 'order', 'exercises'], path);

  return {
    name: asNonEmptyString(record.name, `${path}.name`),
    notes: asNullableString(record.notes, `${path}.notes`),
    order: asInt(record.order, `${path}.order`, 1),
    exercises: parseWorkoutExercises(
      record.exercises,
      `${path}.exercises`,
      exerciseNames,
    ),
  };
}

function parseWorkoutExercises(
  value: unknown,
  path: string,
  exerciseNames: Set<string>,
): CatalogWorkoutExercise[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CatalogParseError(`${path} must be a non-empty array`);
  }

  const exercises = value.map((item, index) =>
    parseWorkoutExercise(item, `${path}[${index}]`, exerciseNames),
  );
  assertUniqueOrders(
    exercises.map((item) => item.order),
    path,
  );
  return exercises;
}

function parseWorkoutExercise(
  value: unknown,
  path: string,
  exerciseNames: Set<string>,
): CatalogWorkoutExercise {
  const record = asObject(value, path);
  assertKeys(
    record,
    [
      'exerciseName',
      'order',
      'targetSets',
      'repMin',
      'repMax',
      'targetWeightKg',
      'restSeconds',
    ],
    path,
  );

  const exerciseName = asNonEmptyString(
    record.exerciseName,
    `${path}.exerciseName`,
  );
  if (!exerciseNames.has(exerciseName)) {
    throw new CatalogParseError(
      `${path}.exerciseName "${exerciseName}" is not in exercises`,
    );
  }

  const repMin = asInt(record.repMin, `${path}.repMin`, 1);
  const repMax = asInt(record.repMax, `${path}.repMax`, 1);
  if (repMin > repMax) {
    throw new CatalogParseError(`${path}.repMin must be <= repMax`);
  }

  return {
    exerciseName,
    order: asInt(record.order, `${path}.order`, 1),
    targetSets: asInt(record.targetSets, `${path}.targetSets`, 1),
    repMin,
    repMax,
    targetWeightKg: asNullableWeight(
      record.targetWeightKg,
      `${path}.targetWeightKg`,
    ),
    restSeconds: asInt(record.restSeconds, `${path}.restSeconds`, 0),
  };
}

function assertUniqueOrders(orders: readonly number[], path: string): void {
  const seen = new Set<number>();
  for (const order of orders) {
    if (seen.has(order)) {
      throw new CatalogParseError(`${path} contains duplicate order ${order}`);
    }
    seen.add(order);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asObject(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new CatalogParseError(`${path} must be an object`);
  }
  return value;
}

function assertKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
): void {
  const extra = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extra.length > 0) {
    throw new CatalogParseError(`${path} has unknown key "${extra[0]}"`);
  }
}

function asNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new CatalogParseError(`${path} must be a non-empty string`);
  }
  return value.trim();
}

function asNullableString(value: unknown, path: string): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new CatalogParseError(`${path} must be a string or null`);
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new CatalogParseError(`${path} must be a boolean`);
  }
  return value;
}

function asInt(value: unknown, path: string, min: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min) {
    throw new CatalogParseError(`${path} must be an integer >= ${min}`);
  }
  return value;
}

function asNullableWeight(value: unknown, path: string): number | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new CatalogParseError(`${path} must be a number >= 0 or null`);
  }
  return value;
}

function asMuscleGroup(value: unknown, path: string): ApiMuscleGroup {
  if (typeof value !== 'string' || !isApiMuscleGroup(value)) {
    throw new CatalogParseError(`${path} is not a valid muscle group`);
  }
  return value;
}

function asEquipment(value: unknown, path: string): ApiEquipment {
  if (typeof value !== 'string' || !isApiEquipment(value)) {
    throw new CatalogParseError(`${path} is not a valid equipment value`);
  }
  return value;
}

function asMuscleGroupList(value: unknown, path: string): ApiMuscleGroup[] {
  if (!Array.isArray(value)) {
    throw new CatalogParseError(`${path} must be an array`);
  }

  const groups = value.map((item, index) =>
    asMuscleGroup(item, `${path}[${index}]`),
  );
  const seen = new Set<ApiMuscleGroup>();
  for (const group of groups) {
    if (seen.has(group)) {
      throw new CatalogParseError(`${path} contains duplicate "${group}"`);
    }
    seen.add(group);
  }
  return groups;
}
