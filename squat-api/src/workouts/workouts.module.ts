import { Module, forwardRef } from '@nestjs/common';
import { WorkoutSessionsModule } from '../workout-sessions/workout-sessions.module.js';
import { WorkoutsController } from './workouts.controller.js';
import { WorkoutsService } from './workouts.service.js';

@Module({
  imports: [forwardRef(() => WorkoutSessionsModule)],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
