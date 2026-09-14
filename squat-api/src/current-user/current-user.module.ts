import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CurrentUserService } from './current-user.service.js';
import { DevAuthGuard } from './dev-auth.guard.js';
import { DevCurrentUserService } from './dev-current-user.service.js';

@Global()
@Module({
  providers: [
    {
      provide: CurrentUserService,
      useClass: DevCurrentUserService,
    },
    {
      provide: APP_GUARD,
      useClass: DevAuthGuard,
    },
  ],
  exports: [CurrentUserService],
})
export class CurrentUserModule {}
