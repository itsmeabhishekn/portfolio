import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { WorkoutsService } from './workouts.service.js';

describe('WorkoutsService', () => {
  const prisma = {
    workout: { findFirst: jest.fn(), findMany: jest.fn() },
    workoutSession: { findFirst: jest.fn(), findMany: jest.fn() },
    program: { findFirst: jest.fn(), update: jest.fn() },
  };

  let service: WorkoutsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(WorkoutsService);
  });

  it('lists templates from the current users active program', async () => {
    prisma.workout.findMany.mockResolvedValue([]);
    prisma.workoutSession.findMany.mockResolvedValue([]);
    await expect(service.listForUser('user-1')).resolves.toEqual([]);
    expect(prisma.workout.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { program: { userId: 'user-1', isActive: true } },
      }),
    );
  });

  it('does not return another users workout', async () => {
    prisma.workout.findFirst.mockResolvedValue(null);

    await expect(
      service.getById('33333333-3333-4333-8333-333333333331', 'other-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: '33333333-3333-4333-8333-333333333331',
          program: { userId: 'other-user' },
        },
      }),
    );
  });

  it('skips the shown day and queues the next template', async () => {
    let nextId = 'push';
    prisma.workoutSession.findFirst.mockResolvedValue(null);
    prisma.program.findFirst.mockImplementation(async () => ({
      id: 'p1',
      userId: 'user-1',
      nextWorkoutId: nextId,
      overrideWorkoutId: null,
      workouts: [
        { id: 'push', name: 'Push A' },
        { id: 'pull', name: 'Pull A' },
      ],
    }));
    prisma.program.update.mockImplementation(
      async (args: { data: { nextWorkoutId: string } }) => {
        nextId = args.data.nextWorkoutId;
        return {};
      },
    );
    prisma.workout.findFirst.mockResolvedValue({
      id: 'pull',
      name: 'Pull A',
      notes: null,
      order: 2,
      program: { id: 'p1', name: 'PPL', description: '' },
      workoutExercises: [],
    });

    const result = await service.skipUpcoming('user-1');
    expect(result.id).toBe('pull');
    expect(prisma.program.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { nextWorkoutId: 'pull', overrideWorkoutId: null },
      }),
    );
  });

  it('chooses another day today without advancing the rotation cursor', async () => {
    prisma.workoutSession.findFirst.mockResolvedValue(null);
    prisma.program.findFirst.mockResolvedValue({
      id: 'p1',
      userId: 'user-1',
      nextWorkoutId: 'push',
      overrideWorkoutId: null,
      workouts: [
        { id: 'push', name: 'Push A' },
        { id: 'pull', name: 'Pull A' },
      ],
    });
    prisma.program.update.mockResolvedValue({});
    prisma.workout.findFirst.mockResolvedValue({
      id: 'pull',
      name: 'Pull A',
      notes: null,
      order: 2,
      program: { id: 'p1', name: 'PPL', description: '' },
      workoutExercises: [],
    });

    await service.chooseUpcoming('user-1', 'pull');
    expect(prisma.program.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { overrideWorkoutId: 'pull' },
      }),
    );
  });

  it('advances the cursor only when the completed day was queued', async () => {
    prisma.workout.findFirst.mockResolvedValue({
      id: 'push',
      program: {
        id: 'p1',
        nextWorkoutId: 'push',
        workouts: [{ id: 'push' }, { id: 'pull' }],
      },
    });
    prisma.program.update.mockResolvedValue({});

    await service.advanceAfterComplete(prisma, 'user-1', 'push');
    expect(prisma.program.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { nextWorkoutId: 'pull', overrideWorkoutId: null },
      }),
    );
  });
});
