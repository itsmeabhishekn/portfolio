import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Prisma } from '@prisma/client';
import { importExerciseCatalogTx } from './import-exercises.js';
import type { ExerciseCatalog } from './exercise-catalog.js';

const catalog: ExerciseCatalog = {
  version: '2.0',
  description: 'test',
  exercises: [
    {
      catalogKey: 'EX_CHEST_UPP_002',
      name: 'Incline Dumbbell Bench Press',
      region: 'Chest',
      focus: 'Upper Chest',
      targetSubdivision: 'Clavicular Pectoralis Major',
      equipmentLabel: 'Dumbbell, Incline Bench',
      movementPattern: 'Incline Horizontal Push',
      mechanics: 'Compound',
      aclFriendly: true,
      shoulderImpingementRisk: 'Low',
      primaryMuscleGroup: 'chest',
      equipment: 'dumbbell',
    },
  ],
};

describe('importExerciseCatalogTx', () => {
  const tx = {
    exercise: {
      findUnique: jest.fn(),
      create: jest.fn(async () => ({ id: 'new' })),
      update: jest.fn(async () => ({ id: 'old' })),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    tx.exercise.create.mockResolvedValue({ id: 'new' });
    tx.exercise.update.mockResolvedValue({ id: 'old' });
  });

  it('creates a catalog row when the name is new', async () => {
    tx.exercise.findUnique.mockResolvedValue(null);

    const result = await importExerciseCatalogTx(
      tx as unknown as Prisma.TransactionClient,
      catalog,
    );

    expect(result).toEqual({ created: 1, updated: 0, total: 1 });
    expect(tx.exercise.create).toHaveBeenCalled();
    expect(tx.exercise.update).not.toHaveBeenCalled();
  });

  it('updates an existing row by name without inventing a duplicate', async () => {
    tx.exercise.findUnique.mockImplementation(async (args: unknown) => {
      const where = (args as { where: { catalogKey?: string; name?: string } })
        .where;
      if (where.name === 'Incline Dumbbell Bench Press') {
        return {
          id: 'old',
          name: 'Incline Dumbbell Bench Press',
          description: 'Keep coaching notes',
          catalogKey: null,
        };
      }
      return null;
    });

    const result = await importExerciseCatalogTx(
      tx as unknown as Prisma.TransactionClient,
      catalog,
    );

    expect(result.updated).toBe(1);
    expect(tx.exercise.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'old' },
        data: expect.objectContaining({
          catalogKey: 'EX_CHEST_UPP_002',
          description: 'Keep coaching notes',
        }),
      }),
    );
  });
});
