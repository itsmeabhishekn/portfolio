import { Test } from '@nestjs/testing';
import { describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('returns true when the database answers', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const module = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    await expect(module.get(HealthService).check()).resolves.toBe(true);
  });

  it('returns false when the database is down', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('down')) };
    const module = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    await expect(module.get(HealthService).check()).resolves.toBe(false);
  });
});
