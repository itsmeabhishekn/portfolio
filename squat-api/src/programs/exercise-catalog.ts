import { readFileSync } from 'node:fs';
import type { ApiEquipment, ApiMuscleGroup } from '../common/domain-map.js';

export class ExerciseCatalogParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExerciseCatalogParseError';
  }
}

export type ShoulderImpingementRisk = 'Low' | 'Moderate' | 'High';
export type Mechanics = 'Compound' | 'Isolation';

export interface TaxonomyExercise {
  catalogKey: string;
  name: string;
  region: string;
  focus: string;
  targetSubdivision: string;
  equipmentLabel: string;
  movementPattern: string;
  mechanics: Mechanics;
  aclFriendly: boolean;
  shoulderImpingementRisk: ShoulderImpingementRisk;
  primaryMuscleGroup: ApiMuscleGroup;
  equipment: ApiEquipment;
}

export interface ExerciseCatalog {
  version: string;
  description: string;
  exercises: TaxonomyExercise[];
}

const EXERCISE_KEYS = [
  'id',
  'region',
  'muscle_group',
  'target_subdivision',
  'exercise_name',
  'equipment',
  'movement_pattern',
  'mechanics',
  'acl_friendly',
  'shoulder_impingement_risk',
] as const;

const FOCUS_TO_MUSCLE: Record<string, ApiMuscleGroup> = {
  'Upper Chest': 'chest',
  'Mid Chest': 'chest',
  'Lower Chest': 'chest',
  Lats: 'back',
  'Upper Back': 'back',
  Traps: 'back',
  'Lower Back': 'back',
  'Front Delts': 'shoulders',
  'Side Delts': 'shoulders',
  'Rear Delts': 'shoulders',
  'Rotator Cuff': 'shoulders',
  Biceps: 'arms',
  'Forearms & Brachialis': 'arms',
  Triceps: 'arms',
  Quads: 'quads',
  Hamstrings: 'hamstrings',
  Glutes: 'glutes',
  Adductors: 'adductors',
  Calves: 'calves',
  Abdominals: 'core',
  Obliques: 'core',
  'Deep Core': 'core',
};

export function loadExerciseCatalog(filePath: string): ExerciseCatalog {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      throw new ExerciseCatalogParseError(`Invalid JSON in ${filePath}`);
    }
    throw error;
  }
  return parseExerciseCatalog(parsed);
}

export function parseExerciseCatalog(value: unknown): ExerciseCatalog {
  const record = asObject(value, 'catalog');
  assertKeys(record, ['database_metadata', 'exercises'], 'catalog');
  const meta = asObject(record.database_metadata, 'database_metadata');
  assertKeys(
    meta,
    ['version', 'description', 'total_records'],
    'database_metadata',
  );

  const exercises = parseExercises(record.exercises);
  const totalRecords = asInt(
    meta.total_records,
    'database_metadata.total_records',
  );
  if (totalRecords !== exercises.length) {
    throw new ExerciseCatalogParseError(
      `database_metadata.total_records is ${totalRecords} but exercises has ${exercises.length}`,
    );
  }

  return {
    version: asNonEmptyString(meta.version, 'database_metadata.version'),
    description: asNonEmptyString(
      meta.description,
      'database_metadata.description',
    ),
    exercises,
  };
}

export function mapFocusToMuscleGroup(focus: string): ApiMuscleGroup {
  const mapped = FOCUS_TO_MUSCLE[focus];
  if (!mapped) {
    throw new ExerciseCatalogParseError(
      `No muscle group mapping for focus "${focus}"`,
    );
  }
  return mapped;
}

export function mapEquipmentLabel(raw: string): ApiEquipment {
  const text = raw.toLowerCase();
  if (text.includes('cable')) {
    return 'cable';
  }
  if (text.includes('dumbbell')) {
    return 'dumbbell';
  }
  if (
    text.includes('barbell') ||
    text.includes('ez-bar') ||
    text.includes('trap bar') ||
    text.includes('hex bar') ||
    text.includes('landmine')
  ) {
    return 'barbell';
  }
  if (
    text.includes('bodyweight') ||
    text.includes('pull-up bar') ||
    text.includes('floor mat')
  ) {
    return 'bodyweight';
  }
  if (
    text.includes('machine') ||
    text.includes('smith') ||
    text.includes('station') ||
    text.includes('preacher') ||
    text.includes('hack squat') ||
    text.includes('dip') ||
    text.includes('abductor') ||
    text.includes('adductor') ||
    text.includes('leg press') ||
    text.includes('leg extension') ||
    text.includes('leg curl') ||
    text.includes('reverse hyper') ||
    text.includes('45-degree')
  ) {
    return 'machine';
  }
  return 'other';
}

function parseExercises(value: unknown): TaxonomyExercise[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ExerciseCatalogParseError('exercises must be a non-empty array');
  }

  const exercises = value.map((item, index) =>
    parseExercise(item, `exercises[${index}]`),
  );
  const keys = new Set<string>();
  const names = new Set<string>();
  for (const exercise of exercises) {
    if (keys.has(exercise.catalogKey)) {
      throw new ExerciseCatalogParseError(
        `Duplicate catalog id "${exercise.catalogKey}"`,
      );
    }
    if (names.has(exercise.name)) {
      throw new ExerciseCatalogParseError(
        `Duplicate exercise name "${exercise.name}"`,
      );
    }
    keys.add(exercise.catalogKey);
    names.add(exercise.name);
  }
  return exercises;
}

function parseExercise(value: unknown, path: string): TaxonomyExercise {
  const record = asObject(value, path);
  assertKeys(record, EXERCISE_KEYS, path);

  const focus = asNonEmptyString(record.muscle_group, `${path}.muscle_group`);
  const equipmentLabel = asNonEmptyString(
    record.equipment,
    `${path}.equipment`,
  );
  const mechanics = asMechanics(record.mechanics, `${path}.mechanics`);
  const shoulderImpingementRisk = asRisk(
    record.shoulder_impingement_risk,
    `${path}.shoulder_impingement_risk`,
  );

  return {
    catalogKey: asNonEmptyString(record.id, `${path}.id`),
    name: asNonEmptyString(record.exercise_name, `${path}.exercise_name`),
    region: asNonEmptyString(record.region, `${path}.region`),
    focus,
    targetSubdivision: asNonEmptyString(
      record.target_subdivision,
      `${path}.target_subdivision`,
    ),
    equipmentLabel,
    movementPattern: asNonEmptyString(
      record.movement_pattern,
      `${path}.movement_pattern`,
    ),
    mechanics,
    aclFriendly: asBoolean(record.acl_friendly, `${path}.acl_friendly`),
    shoulderImpingementRisk,
    primaryMuscleGroup: mapFocusToMuscleGroup(focus),
    equipment: mapEquipmentLabel(equipmentLabel),
  };
}

function asMechanics(value: unknown, path: string): Mechanics {
  if (value !== 'Compound' && value !== 'Isolation') {
    throw new ExerciseCatalogParseError(
      `${path} must be Compound or Isolation`,
    );
  }
  return value;
}

function asRisk(value: unknown, path: string): ShoulderImpingementRisk {
  if (value !== 'Low' && value !== 'Moderate' && value !== 'High') {
    throw new ExerciseCatalogParseError(
      `${path} must be Low, Moderate, or High`,
    );
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asObject(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ExerciseCatalogParseError(`${path} must be an object`);
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
    throw new ExerciseCatalogParseError(
      `${path} has unknown key "${extra[0]}"`,
    );
  }
}

function asNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ExerciseCatalogParseError(`${path} must be a non-empty string`);
  }
  return value.trim();
}

function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ExerciseCatalogParseError(`${path} must be a boolean`);
  }
  return value;
}

function asInt(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new ExerciseCatalogParseError(
      `${path} must be a non-negative integer`,
    );
  }
  return value;
}
