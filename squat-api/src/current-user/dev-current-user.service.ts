import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service.js';
import {
  CurrentUserService,
  type AuthenticatedUser,
} from './current-user.service.js';

@Injectable()
export class DevCurrentUserService extends CurrentUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async getCurrentUser(): Promise<AuthenticatedUser> {
    const email = this.config.getOrThrow<string>('DEV_USER_EMAIL');
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, displayName: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Development user is not seeded. Run prisma:seed.',
      );
    }

    return user;
  }
}
