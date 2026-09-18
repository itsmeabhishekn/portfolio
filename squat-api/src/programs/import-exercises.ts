import type { Prisma, PrismaClient } from '@prisma/client';
import { fromApiEquipment, fromApiMuscleGroup } from '../common/domain-map.js';
import type { ExerciseCatalog, TaxonomyExercise } from './exercise-catalog.js';

export class ExerciseImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExerciseImportError';
  }
}

export interface ExerciseImportResult {
  created: number;
  updated: number;
  total: number;
}

type Db = Prisma.TransactionClient;

export async function importExerciseCatalog(
  prisma: PrismaClient,
  catalog: ExerciseCatalog,
): Promise<ExerciseImportResult> {
  return prisma.$transaction((tx) => importExerciseCatalogTx(tx, catalog), {
    timeout: 30_000,
  });
}

export async function importExerciseCatalogTx(
  tx: Db,
  catalog: ExerciseCatalog,
): Promise<ExerciseImportResult> {
  let created = 0;
  let updated = 0;

  for (const exercise of catalog.exercises) {
    const action = await upsertTaxonomyExercise(tx, exercise);
    if (action === 'created') {
      created += 1;
    } else {
      updated += 1;
    }
  }

  return {
    created,
    updated,
    total: catalog.exercises.length,
  };
}

async function upsertTaxonomyExercise(
  tx: Db,
  exercise: TaxonomyExercise,
): Promise<'created' | 'updated'> {
  const byKey = await tx.exercise.findUnique({
    where: { catalogKey: exercise.catalogKey },
    select: { id: true, name: true, description: true },
  });
  const byName = await tx.exercise.findUnique({
    where: { name: exercise.name },
    select: { id: true, name: true, description: true, catalogKey: true },
  });

  if (byKey && byName && byKey.id !== byName.id) {
    throw new ExerciseImportError(
      `Catalog id ${exercise.catalogKey} and name "${exercise.name}" point at different rows`,
    );
  }

  const existing = byKey ?? byName;
  const data = taxonomyData(exercise);

  if (!existing) {
    await tx.exercise.create({
      data: {
        name: exercise.name,
        description: exercise.targetSubdivision,
        ...data,
      },
    });
    return 'created';
  }

  if (
    byName &&
    byName.catalogKey &&
    byName.catalogKey !== exercise.catalogKey
  ) {
    throw new ExerciseImportError(
      `"${exercise.name}" is already catalogued as ${byName.catalogKey}`,
    );
  }

  await tx.exercise.update({
    where: { id: existing.id },
    data: {
      name: exercise.name,
      ...data,
      description: existing.description ?? exercise.targetSubdivision,
    },
  });
  return 'updated';
}

function taxonomyData(exercise: TaxonomyExercise) {
  return {
    catalogKey: exercise.catalogKey,
    region: exercise.region,
    focus: exercise.focus,
    targetSubdivision: exercise.targetSubdivision,
    movementPattern: exercise.movementPattern,
    mechanics: exercise.mechanics,
    aclFriendly: exercise.aclFriendly,
    shoulderImpingementRisk: exercise.shoulderImpingementRisk,
    primaryMuscleGroup: fromApiMuscleGroup(exercise.primaryMuscleGroup),
    equipment: fromApiEquipment(exercise.equipment),
  };
}
