import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { ProgramsService } from './programs.service.js';

describe('ProgramsService', () => {
  const prisma = {
    program: { findMany: jest.fn(), findFirst: jest.fn() },
    workoutSession: { findMany: jest.fn() },
  };

  let service: ProgramsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ProgramsService);
  });

  it('lists only the current users programs, active first', async () => {
    prisma.program.findMany.mockResolvedValue([]);
    await expect(service.listForUser('user-1')).resolves.toEqual([]);
    expect(prisma.program.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { _count: { select: { workouts: true } } },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('does not return another users program', async () => {
    prisma.program.findFirst.mockResolvedValue(null);
    await expect(
      service.getById('11111111-1111-4111-8111-111111111111', 'other-user'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
