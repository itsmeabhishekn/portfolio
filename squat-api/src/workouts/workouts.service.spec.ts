import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { WorkoutsService } from './workouts.service.js';

describe('WorkoutsService', () => {
  const prisma = {
    workout: { findFirst: jest.fn() },
    workoutSession: { findFirst: jest.fn() },
    program: { findFirst: jest.fn() },
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
});
