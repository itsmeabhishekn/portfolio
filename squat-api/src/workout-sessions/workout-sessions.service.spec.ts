import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { WorkoutsService } from '../workouts/workouts.service.js';
import { WorkoutSessionsService } from './workout-sessions.service.js';

describe('WorkoutSessionsService', () => {
  const prisma = {
    workoutSession: { findFirst: jest.fn(), update: jest.fn() },
    workoutExercise: { findMany: jest.fn() },
    set: { findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  };

  const workouts = {
    assertOwned: jest.fn(),
    advanceAfterComplete: jest.fn(),
  };

  let service: WorkoutSessionsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        WorkoutSessionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: WorkoutsService, useValue: workouts },
      ],
    }).compile();
    service = module.get(WorkoutSessionsService);
  });

  it('resumes an existing in-progress session instead of creating another', async () => {
    const existing = {
      id: 'session-1',
      workoutId: 'workout-1',
      userId: 'user-1',
      status: 'IN_PROGRESS',
      startedAt: new Date('2026-09-12T16:00:00.000Z'),
      completedAt: null,
      workout: { id: 'workout-1', name: 'Push A' },
      exercises: [],
    };
    workouts.assertOwned.mockResolvedValue(undefined);
    prisma.workoutSession.findFirst.mockResolvedValue(existing);

    const result = await service.startOrResume('workout-1', 'user-1');

    expect(result.id).toBe('session-1');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates a session inside a transaction', async () => {
    workouts.assertOwned.mockResolvedValue(undefined);
    prisma.workoutSession.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'session-new',
        workoutId: 'workout-1',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        completedAt: null,
        workout: { id: 'workout-1', name: 'Push A' },
        exercises: [],
      });
    prisma.workoutExercise.findMany.mockResolvedValue([
      {
        id: 'we-1',
        exerciseId: 'ex-1',
        order: 1,
        targetSets: 2,
        targetWeightKg: null,
      },
    ]);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<string>) => {
        const tx = {
          workoutSession: {
            create: jest.fn().mockResolvedValue({ id: 'session-new' }),
          },
          sessionExercise: {
            create: jest.fn().mockResolvedValue({ id: 'se-1' }),
          },
          set: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        return callback(tx);
      },
    );

    const result = await service.startOrResume('workout-1', 'user-1');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('session-new');
  });

  it('does not return another users session', async () => {
    prisma.workoutSession.findFirst.mockResolvedValue(null);
    await expect(
      service.getById('66666666-6666-4666-8666-666666666661', 'other-user'),
    ).rejects.toThrow('Workout session not found');
  });

  it('treats a uniqueness race as a resume', async () => {
    workouts.assertOwned.mockResolvedValue(undefined);
    prisma.workoutSession.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'session-race',
        workoutId: 'workout-1',
        userId: 'user-1',
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        completedAt: null,
        workout: { id: 'workout-1', name: 'Push A' },
        exercises: [],
      });
    prisma.workoutExercise.findMany.mockResolvedValue([]);
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const result = await service.startOrResume('workout-1', 'user-1');
    expect(result.id).toBe('session-race');
  });

  it('updates a set belonging to the current user session', async () => {
    const completedAt = new Date('2026-09-12T17:00:00.000Z');
    prisma.set.findFirst.mockResolvedValue({
      id: 'set-1',
      weightKg: null,
      reps: null,
      rpe: null,
      completedAt: null,
      sessionExercise: {
        sessionId: 'session-1',
        session: { status: 'IN_PROGRESS', userId: 'user-1' },
      },
    });
    prisma.set.update.mockResolvedValue({});
    prisma.workoutSession.findFirst.mockResolvedValue({
      id: 'session-1',
      workoutId: 'workout-1',
      userId: 'user-1',
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      completedAt: null,
      workout: { id: 'workout-1', name: 'Push A' },
      exercises: [
        {
          id: 'se-1',
          order: 1,
          exercise: {
            id: 'ex-1',
            name: 'Bench',
            description: null,
            primaryMuscleGroup: 'CHEST',
            secondaryMuscleGroups: [],
            equipment: 'BARBELL',
          },
          workoutExercise: {
            id: 'we-1',
            order: 1,
            targetSets: 1,
            repMin: 5,
            repMax: 5,
            targetWeightKg: 80,
            restSeconds: 90,
            exercise: {
              id: 'ex-1',
              name: 'Bench',
              description: null,
              primaryMuscleGroup: 'CHEST',
              secondaryMuscleGroups: [],
              equipment: 'BARBELL',
            },
          },
          sets: [
            {
              id: 'set-1',
              setNumber: 1,
              weightKg: 80,
              reps: 5,
              rpe: 8,
              completedAt,
            },
          ],
        },
      ],
    });

    const result = await service.updateSet('session-1', 'set-1', 'user-1', {
      weightKg: 80,
      reps: 5,
      rpe: 8,
      completed: true,
    });

    expect(prisma.set.update).toHaveBeenCalled();
    expect(result.exercises[0]?.sets[0]?.completed).toBe(true);
  });

  it('does not complete a set just because weight and reps are present', async () => {
    prisma.set.findFirst.mockResolvedValue({
      id: 'set-1',
      weightKg: null,
      reps: null,
      rpe: null,
      completedAt: null,
      sessionExercise: {
        sessionId: 'session-1',
        session: { status: 'IN_PROGRESS', userId: 'user-1' },
      },
    });
    prisma.set.update.mockResolvedValue({});
    prisma.workoutSession.findFirst.mockResolvedValue({
      id: 'session-1',
      workoutId: 'workout-1',
      userId: 'user-1',
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      completedAt: null,
      workout: { id: 'workout-1', name: 'Push A' },
      exercises: [],
    });

    await service.updateSet('session-1', 'set-1', 'user-1', {
      weightKg: 80,
      reps: 8,
    });

    expect(prisma.set.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { weightKg: 80, reps: 8 },
      }),
    );
  });

  it('rejects completing a set without weight and reps', async () => {
    prisma.set.findFirst.mockResolvedValue({
      id: 'set-1',
      weightKg: null,
      reps: null,
      rpe: null,
      completedAt: null,
      sessionExercise: {
        sessionId: 'session-1',
        session: { status: 'IN_PROGRESS', userId: 'user-1' },
      },
    });

    await expect(
      service.updateSet('session-1', 'set-1', 'user-1', { completed: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.set.update).not.toHaveBeenCalled();
  });

  it('does not update a set from another session', async () => {
    prisma.set.findFirst.mockResolvedValue(null);
    await expect(
      service.updateSet('session-a', 'set-from-b', 'user-1', { reps: 5 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not update another users set', async () => {
    prisma.set.findFirst.mockResolvedValue(null);
    await expect(
      service.updateSet('session-1', 'set-1', 'other-user', { reps: 5 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not update sets on a completed session', async () => {
    prisma.set.findFirst.mockResolvedValue({
      id: 'set-1',
      weightKg: 80,
      reps: 5,
      rpe: null,
      completedAt: new Date(),
      sessionExercise: {
        sessionId: 'session-1',
        session: { status: 'COMPLETED', userId: 'user-1' },
      },
    });

    await expect(
      service.updateSet('session-1', 'set-1', 'user-1', { reps: 6 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('keeps the original completedAt on repeated set completion', async () => {
    const original = new Date('2026-09-12T17:00:00.000Z');
    prisma.set.findFirst.mockResolvedValue({
      id: 'set-1',
      weightKg: 80,
      reps: 5,
      rpe: null,
      completedAt: original,
      sessionExercise: {
        sessionId: 'session-1',
        session: { status: 'IN_PROGRESS', userId: 'user-1' },
      },
    });
    prisma.set.update.mockResolvedValue({});
    prisma.workoutSession.findFirst.mockResolvedValue({
      id: 'session-1',
      workoutId: 'workout-1',
      userId: 'user-1',
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      completedAt: null,
      workout: { id: 'workout-1', name: 'Push A' },
      exercises: [],
    });

    await service.updateSet('session-1', 'set-1', 'user-1', {
      weightKg: 82.5,
      reps: 5,
      completed: true,
    });

    expect(prisma.set.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ completedAt: original }),
      }),
    );
  });

  it('rejects completing a session with incomplete sets', async () => {
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<void>) =>
        callback(prisma),
    );
    prisma.workoutSession.findFirst.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      status: 'IN_PROGRESS',
      exercises: [{ sets: [{ completedAt: null }] }],
    });

    await expect(
      service.complete('session-1', 'user-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.workoutSession.update).not.toHaveBeenCalled();
  });

  it('completes an in-progress session when all sets are done', async () => {
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<void>) =>
        callback(prisma),
    );
    prisma.workoutSession.findFirst
      .mockResolvedValueOnce({
        id: 'session-1',
        userId: 'user-1',
        workoutId: 'workout-1',
        status: 'IN_PROGRESS',
        exercises: [{ sets: [{ completedAt: new Date() }] }],
      })
      .mockResolvedValueOnce({
        id: 'session-1',
        workoutId: 'workout-1',
        userId: 'user-1',
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        workout: { id: 'workout-1', name: 'Push A' },
        exercises: [],
      });
    prisma.workoutSession.update.mockResolvedValue({});
    workouts.advanceAfterComplete.mockResolvedValue(undefined);

    const result = await service.complete('session-1', 'user-1');
    expect(prisma.workoutSession.update).toHaveBeenCalled();
    expect(workouts.advanceAfterComplete).toHaveBeenCalled();
    expect(result.status).toBe('completed');
    expect(result.completedAt).not.toBeNull();
  });

  it('does not complete another users session', async () => {
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<void>) =>
        callback(prisma),
    );
    prisma.workoutSession.findFirst.mockResolvedValue(null);

    await expect(
      service.complete('session-1', 'other-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns an already completed session without rewriting it', async () => {
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<void>) =>
        callback(prisma),
    );
    prisma.workoutSession.findFirst
      .mockResolvedValueOnce({
        id: 'session-1',
        userId: 'user-1',
        status: 'COMPLETED',
        exercises: [],
      })
      .mockResolvedValueOnce({
        id: 'session-1',
        workoutId: 'workout-1',
        userId: 'user-1',
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date('2026-09-12T18:00:00.000Z'),
        workout: { id: 'workout-1', name: 'Push A' },
        exercises: [],
      });

    const result = await service.complete('session-1', 'user-1');
    expect(prisma.workoutSession.update).not.toHaveBeenCalled();
    expect(result.status).toBe('completed');
  });
});
