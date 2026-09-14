import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { WorkoutTemplateResponseDto } from './dto/workout-response.dto.js';
import { toWorkoutTemplateDto } from './workout.mapper.js';

const workoutDetailInclude = {
  program: true,
  workoutExercises: {
    include: { exercise: true },
    orderBy: { order: 'asc' as const },
  },
};

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(
    workoutId: string,
    currentUserId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const workout = await this.findOwnedWorkout(workoutId, currentUserId);
    const inProgress = await this.hasInProgressSession(
      currentUserId,
      workoutId,
    );
    return toWorkoutTemplateDto(workout, inProgress);
  }

  async getUpcoming(
    currentUserId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const active = await this.prisma.workoutSession.findFirst({
      where: { userId: currentUserId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
    });

    if (active) {
      return this.getById(active.workoutId, currentUserId);
    }

    const program = await this.prisma.program.findFirst({
      where: { userId: currentUserId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { workouts: { orderBy: { order: 'asc' } } },
    });

    const rotation = program?.workouts ?? [];
    if (!program || rotation.length === 0) {
      throw new NotFoundException('No upcoming workout');
    }

    const lastCompleted = await this.prisma.workoutSession.findFirst({
      where: { userId: currentUserId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
    });

    const lastIndex = lastCompleted
      ? rotation.findIndex((item) => item.id === lastCompleted.workoutId)
      : -1;
    const next = rotation[(lastIndex + 1) % rotation.length];
    if (!next) {
      throw new NotFoundException('No upcoming workout');
    }

    return this.getById(next.id, currentUserId);
  }

  async assertOwned(
    workoutId: string,
    currentUserId: string,
  ): Promise<void> {
    await this.findOwnedWorkout(workoutId, currentUserId);
  }

  async hasInProgressSession(
    currentUserId: string,
    workoutId: string,
  ): Promise<boolean> {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        userId: currentUserId,
        workoutId,
        status: 'IN_PROGRESS',
      },
      select: { id: true },
    });
    return session !== null;
  }

  private async findOwnedWorkout(workoutId: string, currentUserId: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, program: { userId: currentUserId } },
      include: workoutDetailInclude,
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return workout;
  }
}
