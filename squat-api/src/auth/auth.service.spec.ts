import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service.js';
import { AuthService } from './auth.service.js';
import {
  GoogleIdentityVerifier,
  type GoogleIdentity,
} from './google-identity.service.js';
import { SessionTokenService } from './session-token.service.js';
import { StarterProgramService } from './starter-program.service.js';

const identity: GoogleIdentity = {
  sub: 'google-sub-1',
  email: 'lifter@example.test',
  displayName: 'Lifter One',
};

function uniqueViolation(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('unique', {
    code: 'P2002',
    clientVersion: 'test',
  });
}

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const google = { verify: jest.fn() };
  const tokens = { issue: jest.fn(), readUserId: jest.fn() };
  const starterProgram = { provision: jest.fn() };

  let service: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    google.verify.mockResolvedValue(identity as never);
    tokens.issue.mockResolvedValue('session-token' as never);
    prisma.$transaction.mockImplementation((run: unknown) =>
      (run as (tx: unknown) => Promise<unknown>)(prisma),
    );

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: GoogleIdentityVerifier, useValue: google },
        { provide: SessionTokenService, useValue: tokens },
        { provide: StarterProgramService, useValue: starterProgram },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('creates a user with a starter program on first sign-in', async () => {
    prisma.user.findUnique.mockResolvedValue(null as never);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: identity.email,
      displayName: identity.displayName,
    } as never);

    const result = await service.signInWithGoogle('credential');

    expect(result.token).toBe('session-token');
    expect(result.user.id).toBe('user-1');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          googleSub: identity.sub,
          email: identity.email,
          displayName: identity.displayName,
        },
      }),
    );
    expect(starterProgram.provision).toHaveBeenCalledWith(prisma, 'user-1');
  });

  it('matches an existing user by Google sub without creating a duplicate', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: identity.email,
      displayName: identity.displayName,
    } as never);

    const result = await service.signInWithGoogle('credential');

    expect(result.user.id).toBe('user-1');
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { googleSub: identity.sub } }),
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(starterProgram.provision).not.toHaveBeenCalled();
  });

  it('refreshes a changed email from the verified Google profile', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'old@example.test',
      displayName: 'Old Name',
    } as never);
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: identity.email,
      displayName: identity.displayName,
    } as never);

    const result = await service.signInWithGoogle('credential');

    expect(result.user.email).toBe(identity.email);
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('keeps the stored profile when the new email belongs to another account', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'old@example.test',
      displayName: 'Old Name',
    } as never);
    prisma.user.update.mockRejectedValue(uniqueViolation() as never);

    const result = await service.signInWithGoogle('credential');

    expect(result.user.email).toBe('old@example.test');
  });

  it('resolves the winner when two first sign-ins race', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce({
        id: 'user-winner',
        email: identity.email,
        displayName: identity.displayName,
      } as never);
    prisma.user.create.mockRejectedValue(uniqueViolation() as never);

    const result = await service.signInWithGoogle('credential');

    expect(result.user.id).toBe('user-winner');
  });

  it('rejects sign-in when the email is taken by a different identity', async () => {
    prisma.user.findUnique.mockResolvedValue(null as never);
    prisma.user.create.mockRejectedValue(uniqueViolation() as never);

    await expect(service.signInWithGoogle('credential')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('never reaches the database when Google rejects the credential', async () => {
    google.verify.mockRejectedValue(
      new UnauthorizedException('Google sign-in could not be verified.') as never,
    );

    await expect(service.signInWithGoogle('bad')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a session for a user that no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null as never);

    await expect(service.loadUser('user-gone')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
