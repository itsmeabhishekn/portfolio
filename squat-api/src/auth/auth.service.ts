import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  GoogleIdentityVerifier,
  type GoogleIdentity,
} from './google-identity.service.js';
import { SessionTokenService } from './session-token.service.js';
import { StarterProgramService } from './starter-program.service.js';

const userFields = {
  id: true,
  email: true,
  displayName: true,
} satisfies Prisma.UserSelect;

export interface SignInResult {
  token: string;
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly google: GoogleIdentityVerifier,
    private readonly tokens: SessionTokenService,
    private readonly starterProgram: StarterProgramService,
  ) {}

  async signInWithGoogle(credential: string): Promise<SignInResult> {
    const identity = await this.google.verify(credential);
    const user = await this.resolveUser(identity);
    return { token: await this.tokens.issue(user.id), user };
  }

  async loadUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userFields,
    });

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return user;
  }

  private async resolveUser(
    identity: GoogleIdentity,
  ): Promise<AuthenticatedUser> {
    const existing = await this.prisma.user.findUnique({
      where: { googleSub: identity.sub },
      select: userFields,
    });

    if (existing) {
      return this.refreshProfile(existing, identity);
    }

    try {
      return await this.createUser(identity);
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        // Either two first sign-ins raced, or this Google account's email already
        // belongs to a different identity. Re-reading by sub distinguishes them.
        const raced = await this.prisma.user.findUnique({
          where: { googleSub: identity.sub },
          select: userFields,
        });
        if (raced) {
          return raced;
        }
        throw new UnauthorizedException(
          'That email address is already linked to another account.',
        );
      }
      throw error;
    }
  }

  private async createUser(
    identity: GoogleIdentity,
  ): Promise<AuthenticatedUser> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          googleSub: identity.sub,
          email: identity.email,
          displayName: identity.displayName,
        },
        select: userFields,
      });
      await this.starterProgram.provision(tx, user.id);
      return user;
    });
  }

  private async refreshProfile(
    user: AuthenticatedUser,
    identity: GoogleIdentity,
  ): Promise<AuthenticatedUser> {
    if (
      user.email === identity.email &&
      user.displayName === identity.displayName
    ) {
      return user;
    }

    try {
      return await this.prisma.user.update({
        where: { id: user.id },
        data: { email: identity.email, displayName: identity.displayName },
        select: userFields,
      });
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        // Another account already holds the new address. Linking by email would be
        // an account-takeover path, so the stored profile simply stays as it is.
        return user;
      }
      throw error;
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
