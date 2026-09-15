import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
  GoogleIdentityService,
  GoogleIdentityVerifier,
} from './google-identity.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { SessionTokenService } from './session-token.service.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('SESSION_JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionTokenService,
    {
      provide: GoogleIdentityVerifier,
      useClass: GoogleIdentityService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, SessionTokenService],
})
export class AuthModule {}
