import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Prisma, PrismaClient } from '@prisma/client';
import {
  importProgramForEmail,
  importProgramForUser,
  ProgramImportError,
} from './import-program.js';
import type { ProgramCatalog } from './program-catalog.js';

const catalog: ProgramCatalog = {
  exercises: [
    {
      name: 'Lat Pulldown',
      description: null,
      primaryMuscleGroup: 'back',
      secondaryMuscleGroups: [],
      equipment: 'cable',
    },
  ],
  program: {
    name: 'Test',
    description: 'Test',
    isActive: true,
    workouts: [
      {
        name: 'Pull',
        notes: null,
        order: 1,
        exercises: [
          {
            exerciseName: 'Lat Pulldown',
            order: 1,
            targetSets: 3,
            repMin: 8,
            repMax: 10,
            targetWeightKg: null,
            restSeconds: 120,
          },
        ],
      },
    ],
  },
};

function fakeTx(options?: {
  latestProgramId?: string;
  sessionCount?: number;
}): Prisma.TransactionClient {
  return {
    exercise: {
      findUnique: jest.fn(async () => null),
      create: jest.fn(async () => ({
        id: 'exercise-1',
        name: 'Lat Pulldown',
      })),
    },
    workout: {
      findFirst: jest.fn(async () => ({ id: 'workout-1' })),
    },
    program: {
      findFirst: jest.fn(async () =>
        options?.latestProgramId ? { id: options.latestProgramId } : null,
      ),
      delete: jest.fn(async () => ({ id: options?.latestProgramId })),
      updateMany: jest.fn(async () => ({ count: 1 })),
      create: jest.fn(async () => ({ id: 'program-new' })),
      update: jest.fn(async () => ({ id: 'program-new' })),
    },
    workoutSession: {
      count: jest.fn(async () => options?.sessionCount ?? 0),
    },
  } as unknown as Prisma.TransactionClient;
}

describe('importProgramForEmail', () => {
  const prisma = {
    user: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('does not create a user when the email has never signed in', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      importProgramForEmail(prisma as unknown as PrismaClient, {
        email: 'nobody@example.test',
        catalog,
      }),
    ).rejects.toBeInstanceOf(ProgramImportError);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('importProgramForUser', () => {
  it('creates a program when the user has none with that name', async () => {
    const tx = fakeTx();
    const result = await importProgramForUser(tx, 'user-1', catalog);

    expect(result).toMatchObject({
      action: 'created',
      programId: 'program-new',
      userId: 'user-1',
      workoutCount: 1,
      exerciseCount: 1,
    });
    expect(tx.program.delete).not.toHaveBeenCalled();
    expect(tx.program.updateMany).toHaveBeenCalled();
    expect(tx.program.create).toHaveBeenCalled();
  });

  it('replaces an unused program and versions one that already has sessions', async () => {
    const unused = fakeTx({ latestProgramId: 'program-old', sessionCount: 0 });
    const replaced = await importProgramForUser(unused, 'user-1', catalog);
    expect(replaced.action).toBe('replaced');
    expect(unused.program.delete).toHaveBeenCalledWith({
      where: { id: 'program-old' },
    });

    const used = fakeTx({ latestProgramId: 'program-old', sessionCount: 1 });
    const versioned = await importProgramForUser(used, 'user-1', catalog);
    expect(versioned.action).toBe('versioned');
    expect(used.program.delete).not.toHaveBeenCalled();
  });
});
