import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { DataResponseInterceptor } from './common/data-response.interceptor.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { ProgramsModule } from './programs/programs.module.js';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module.js';
import { WorkoutsModule } from './workouts/workouts.module.js';
import { ExercisesModule } from './exercises/exercises.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ProgramsModule,
    WorkoutsModule,
    WorkoutSessionsModule,
    ExercisesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
  ],
})
export class AppModule {}
