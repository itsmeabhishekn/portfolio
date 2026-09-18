import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'node:url';
import { importProgramForEmail } from '../src/programs/import-program.js';
import { loadProgramCatalog } from '../src/programs/program-catalog.js';

const catalogPath = fileURLToPath(
  new URL('../data/programs/hypertrophy-stability.json', import.meta.url),
);

const IMPORT_USER = {
  id: '11111111-1111-4111-8111-1111111111aa',
  googleSub: 'google-sub-program-import',
  email: 'importer@squat.test',
  displayName: 'Importer',
} as const;

describe('program catalog import', () => {
  const prisma = new PrismaClient();
  const catalog = loadProgramCatalog(catalogPath);

  beforeAll(async () => {
    await cleanup();
    await prisma.user.create({ data: IMPORT_USER });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('loads the split onto an existing user and replaces unused templates', async () => {
    const first = await importProgramForEmail(prisma, {
      email: IMPORT_USER.email,
      catalog,
    });
    expect(first.action).toBe('created');
    expect(first.workoutCount).toBe(5);

    const upcoming = await prisma.workout.findFirst({
      where: { program: { userId: IMPORT_USER.id, isActive: true } },
      orderBy: { order: 'asc' },
      include: {
        workoutExercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    expect(upcoming?.name).toBe('Lower Body A');
    expect(upcoming?.workoutExercises[0]?.exercise.name).toBe(
      'Dumbbell Romanian Deadlift',
    );

    const squat = await prisma.workoutExercise.findFirst({
      where: {
        workout: { programId: first.programId, name: 'Lower Body B' },
        exercise: { name: 'Smith Machine Squat' },
      },
    });
    expect(squat?.targetWeightKg?.toNumber()).toBe(40);

    const replaced = await importProgramForEmail(prisma, {
      email: IMPORT_USER.email,
      catalog,
    });
    expect(replaced.action).toBe('replaced');
    expect(
      await prisma.program.count({ where: { userId: IMPORT_USER.id } }),
    ).toBe(1);
  });

  it('keeps history and versions the program after a session exists', async () => {
    const current = await prisma.program.findFirstOrThrow({
      where: { userId: IMPORT_USER.id, isActive: true },
      include: { workouts: { orderBy: { order: 'asc' } } },
    });
    const firstWorkout = current.workouts[0];
    if (!firstWorkout) {
      throw new Error('Expected an imported workout');
    }

    await prisma.workoutSession.create({
      data: {
        userId: IMPORT_USER.id,
        workoutId: firstWorkout.id,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    const versioned = await importProgramForEmail(prisma, {
      email: IMPORT_USER.email,
      catalog,
    });
    expect(versioned.action).toBe('versioned');
    expect(versioned.programId).not.toBe(current.id);

    const programs = await prisma.program.findMany({
      where: { userId: IMPORT_USER.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(programs).toHaveLength(2);
    expect(programs[0]?.isActive).toBe(false);
    expect(programs[1]?.isActive).toBe(true);
    expect(
      await prisma.workoutSession.count({
        where: { userId: IMPORT_USER.id, workoutId: firstWorkout.id },
      }),
    ).toBe(1);
  });

  async function cleanup(): Promise<void> {
    await prisma.workoutSession.deleteMany({
      where: { userId: IMPORT_USER.id },
    });
    await prisma.program.deleteMany({ where: { userId: IMPORT_USER.id } });
    await prisma.user.deleteMany({ where: { id: IMPORT_USER.id } });
  }
});
