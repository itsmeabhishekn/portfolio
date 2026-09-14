import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import { CurrentUserService } from './current-user.service.js';
import type { AuthenticatedUser } from './current-user.service.js';

export type RequestWithUser = Request & { user: AuthenticatedUser };

@Injectable()
export class DevAuthGuard implements CanActivate {
  constructor(
    private readonly currentUser: CurrentUserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    request.user = await this.currentUser.getCurrentUser();
    return true;
  }
}
