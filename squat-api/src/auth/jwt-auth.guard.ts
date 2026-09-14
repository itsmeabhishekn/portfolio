import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithUser } from '../current-user/authenticated-user.js';
import { IS_PUBLIC_KEY } from '../current-user/public.decorator.js';
import { AuthService } from './auth.service.js';
import { SessionTokenService } from './session-token.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: SessionTokenService,
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
    const token = bearerToken(request.headers.authorization);
    if (token === null) {
      throw new UnauthorizedException('Authentication required.');
    }

    const userId = await this.tokens.readUserId(token);
    // Read the user on every request so a deleted account stops working
    // immediately rather than when its token happens to expire.
    request.user = await this.auth.loadUser(userId);
    return true;
  }
}

function bearerToken(header: string | undefined): string | null {
  if (header === undefined) {
    return null;
  }
  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) {
    return null;
  }
  return value.trim() || null;
}
