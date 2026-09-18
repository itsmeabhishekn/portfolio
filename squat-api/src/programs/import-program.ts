import type { Prisma, PrismaClient } from '@prisma/client';
import { fromApiEquipment, fromApiMuscleGroup } from '../common/domain-map.js';
import type { ProgramCatalog } from './program-catalog.js';

export class ProgramImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgramImportError';
  }
}

export type ProgramImportAction = 'created' | 'replaced' | 'versioned';

export interface ProgramImportResult {
  action: ProgramImportAction;
  programId: string;
  userId: string;
  workoutCount: number;
  exerciseCount: number;
}

type Db = Prisma.TransactionClient;

export async function importProgramForEmail(
  prisma: PrismaClient,
  options: { email: string; catalog: ProgramCatalog },
): Promise<ProgramImportResult> {
  const email = options.email.trim();
  if (email.length === 0) {
    throw new ProgramImportError('Email is required.');
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new ProgramImportError(
      `No user for ${email}. Sign in with Google once, then re-run the import.`,
    );
  }

  return prisma.$transaction(
    (tx) => importProgramForUser(tx, user.id, options.catalog),
    { timeout: 20_000 },
  );
}

export async function importProgramForUser(
  tx: Db,
  userId: string,
  catalog: ProgramCatalog,
): Promise<ProgramImportResult> {
  const exerciseIds = await upsertExercises(tx, catalog);

  const latest = await tx.program.findFirst({
    where: { userId, name: catalog.program.name },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  let action: ProgramImportAction = 'created';
  if (latest) {
    const sessionCount = await tx.workoutSession.count({
      where: { workout: { programId: latest.id } },
    });
    if (sessionCount === 0) {
      await tx.program.delete({ where: { id: latest.id } });
      action = 'replaced';
    } else {
      action = 'versioned';
    }
  }

  if (catalog.program.isActive) {
    await tx.program.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  const program = await tx.program.create({
    data: {
      userId,
      name: catalog.program.name,
      description: catalog.program.description,
      isActive: catalog.program.isActive,
      workouts: {
        create: catalog.program.workouts.map((workout) => ({
          name: workout.name,
          notes: workout.notes,
          order: workout.order,
          workoutExercises: {
            create: workout.exercises.map((item) => {
              const exerciseId = exerciseIds.get(item.exerciseName);
              if (!exerciseId) {
                throw new ProgramImportError(
                  `Missing exercise "${item.exerciseName}"`,
                );
              }
              return {
                exerciseId,
                order: item.order,
                targetSets: item.targetSets,
                repMin: item.repMin,
                repMax: item.repMax,
                targetWeightKg: item.targetWeightKg,
                restSeconds: item.restSeconds,
              };
            }),
          },
        })),
      },
    },
    select: { id: true },
  });

  return {
    action,
    programId: program.id,
    userId,
    workoutCount: catalog.program.workouts.length,
    exerciseCount: catalog.exercises.length,
  };
}

async function upsertExercises(
  tx: Db,
  catalog: ProgramCatalog,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const exercise of catalog.exercises) {
    const data = {
      description: exercise.description,
      primaryMuscleGroup: fromApiMuscleGroup(exercise.primaryMuscleGroup),
      secondaryMuscleGroups:
        exercise.secondaryMuscleGroups.map(fromApiMuscleGroup),
      equipment: fromApiEquipment(exercise.equipment),
    };
    const row = await tx.exercise.upsert({
      where: { name: exercise.name },
      create: { name: exercise.name, ...data },
      update: data,
      select: { id: true, name: true },
    });
    ids.set(row.name, row.id);
  }
  return ids;
}
