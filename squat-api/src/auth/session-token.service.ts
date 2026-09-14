import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

interface SessionClaims {
  sub: string;
}

@Injectable()
export class SessionTokenService {
  constructor(private readonly jwt: JwtService) {}

  async issue(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId } satisfies SessionClaims,
      { expiresIn: SESSION_TTL_SECONDS },
    );
  }

  async readUserId(token: string): Promise<string> {
    let claims: SessionClaims;
    try {
      claims = await this.jwt.verifyAsync<SessionClaims>(token);
    } catch {
      throw new UnauthorizedException('Your session has expired.');
    }

    if (typeof claims.sub !== 'string' || claims.sub.length === 0) {
      throw new UnauthorizedException('Your session has expired.');
    }

    return claims.sub;
  }
}
