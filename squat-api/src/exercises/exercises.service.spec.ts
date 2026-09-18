import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { ExercisesService } from './exercises.service.js';

describe('ExercisesService', () => {
  const prisma = {
    exercise: { findMany: jest.fn(), findUnique: jest.fn() },
  };

  let service: ExercisesService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ExercisesService);
  });

  it('lists catalog rows in region order', async () => {
    prisma.exercise.findMany.mockResolvedValue([]);
    await expect(service.list()).resolves.toEqual([]);
    expect(prisma.exercise.findMany).toHaveBeenCalledWith({
      orderBy: [{ region: 'asc' }, { focus: 'asc' }, { name: 'asc' }],
    });
  });

  it('throws when an exercise id is missing', async () => {
    prisma.exercise.findUnique.mockResolvedValue(null);
    await expect(
      service.getById('11111111-1111-4111-8111-111111111111'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
