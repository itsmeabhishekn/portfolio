import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleIdentity {
  sub: string;
  email: string;
  displayName: string;
}

export abstract class GoogleIdentityVerifier {
  abstract verify(credential: string): Promise<GoogleIdentity>;
}

@Injectable()
export class GoogleIdentityService extends GoogleIdentityVerifier {
  private readonly audience: string;
  private readonly client: OAuth2Client;

  constructor(config: ConfigService) {
    super();
    this.audience = config.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.client = new OAuth2Client(this.audience);
  }

  async verify(credential: string): Promise<GoogleIdentity> {
    const payload = await this.readPayload(credential);

    if (!payload?.sub) {
      throw new UnauthorizedException('Google sign-in could not be verified.');
    }

    // An unverified address could be claimed by someone who does not own it, so it
    // must never reach the database as an identity.
    if (!payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException(
        'Your Google account has no verified email address.',
      );
    }

    return {
      sub: payload.sub,
      email: payload.email,
      displayName: payload.name?.trim() || payload.email,
    };
  }

  private async readPayload(credential: string) {
    try {
      // Checks the signature against Google's published keys plus the audience,
      // issuer, and expiry claims.
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: this.audience,
      });
      return ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Google sign-in could not be verified.');
    }
  }
}
