import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import type {
  WorkoutSummaryDto,
  WorkoutTemplateResponseDto,
} from './dto/workout-response.dto.js';
import {
  nextWorkoutAfter,
  queuedWorkoutId,
  shownWorkoutId,
  type UpcomingSource,
} from './rotation.js';
import { toWorkoutSummaryDto, toWorkoutTemplateDto } from './workout.mapper.js';

const workoutDetailInclude = {
  program: true,
  workoutExercises: {
    include: { exercise: true },
    orderBy: { order: 'asc' as const },
  },
};

type Db = Prisma.TransactionClient | PrismaService;

type ActiveProgram = NonNullable<
  Awaited<ReturnType<WorkoutsService['loadActiveProgram']>>
>;

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(currentUserId: string): Promise<WorkoutSummaryDto[]> {
    const [workouts, sessions] = await Promise.all([
      this.prisma.workout.findMany({
        where: { program: { userId: currentUserId, isActive: true } },
        include: workoutDetailInclude,
        orderBy: [{ program: { createdAt: 'desc' } }, { order: 'asc' }],
      }),
      this.prisma.workoutSession.findMany({
        where: { userId: currentUserId, status: 'IN_PROGRESS' },
        select: { workoutId: true },
      }),
    ]);
    const inProgressIds = new Set(sessions.map((row) => row.workoutId));
    return workouts.map((workout) =>
      toWorkoutSummaryDto(workout, inProgressIds.has(workout.id)),
    );
  }

  async getById(
    workoutId: string,
    currentUserId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const workout = await this.findOwnedWorkout(workoutId, currentUserId);
    const inProgress = await this.hasInProgressSession(
      currentUserId,
      workoutId,
    );
    const upcoming = await this.resolveUpcoming(currentUserId);
    return toWorkoutTemplateDto(workout, inProgress, {
      source: upcoming?.source ?? 'rotation',
      queuedName: upcoming?.queuedName ?? null,
      isUpcoming: upcoming?.workoutId === workoutId,
    });
  }

  async getUpcoming(
    currentUserId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const upcoming = await this.resolveUpcoming(currentUserId);
    if (!upcoming) {
      throw new NotFoundException('No upcoming workout');
    }
    return this.getById(upcoming.workoutId, currentUserId);
  }

  async skipUpcoming(
    currentUserId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    await this.abandonOpenSessions(currentUserId);
    const program = await this.loadActiveProgram(currentUserId);
    if (!program || program.workouts.length === 0) {
      throw new NotFoundException('No upcoming workout');
    }
    const shownId = await this.shownIdFor(program);
    if (!shownId) {
      throw new NotFoundException('No upcoming workout');
    }
    const nextId = nextWorkoutAfter(program.workouts, shownId);
    await this.prisma.program.update({
      where: { id: program.id },
      data: { nextWorkoutId: nextId, overrideWorkoutId: null },
    });
    return this.getUpcoming(currentUserId);
  }

  async chooseUpcoming(
    currentUserId: string,
    workoutId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    await this.abandonOpenSessions(currentUserId);
    const program = await this.loadActiveProgram(currentUserId);
    if (!program || program.workouts.length === 0) {
      throw new NotFoundException('No upcoming workout');
    }
    if (!program.workouts.some((item) => item.id === workoutId)) {
      throw new NotFoundException('Workout not found');
    }
    const queuedId = await this.ensureQueuedId(program);
    await this.prisma.program.update({
      where: { id: program.id },
      data: {
        overrideWorkoutId: workoutId === queuedId ? null : workoutId,
      },
    });
    return this.getUpcoming(currentUserId);
  }

  async advanceAfterComplete(
    db: Db,
    currentUserId: string,
    completedWorkoutId: string,
  ): Promise<void> {
    const workout = await db.workout.findFirst({
      where: { id: completedWorkoutId, program: { userId: currentUserId } },
      include: {
        program: { include: { workouts: { orderBy: { order: 'asc' } } } },
      },
    });
    if (!workout) {
      return;
    }
    const nextId =
      workout.program.nextWorkoutId === completedWorkoutId
        ? nextWorkoutAfter(workout.program.workouts, completedWorkoutId)
        : workout.program.nextWorkoutId;
    await db.program.update({
      where: { id: workout.program.id },
      data: {
        nextWorkoutId: nextId,
        overrideWorkoutId: null,
      },
    });
  }

  async assertOwned(workoutId: string, currentUserId: string): Promise<void> {
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

  private async resolveUpcoming(currentUserId: string): Promise<{
    workoutId: string;
    source: UpcomingSource;
    queuedName: string | null;
  } | null> {
    const active = await this.prisma.workoutSession.findFirst({
      where: { userId: currentUserId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
      include: { workout: true },
    });
    if (active) {
      return {
        workoutId: active.workoutId,
        source: 'in_progress',
        queuedName: null,
      };
    }

    const program = await this.loadActiveProgram(currentUserId);
    if (!program || program.workouts.length === 0) {
      return null;
    }

    const queuedId = await this.ensureQueuedId(program);
    const shownId = shownWorkoutId(
      queuedId,
      program.overrideWorkoutId,
      program.workouts,
    );
    if (!shownId) {
      return null;
    }
    const queued = program.workouts.find((item) => item.id === queuedId);
    const isOverride = shownId !== queuedId;
    return {
      workoutId: shownId,
      source: isOverride ? 'override' : 'rotation',
      queuedName: isOverride ? (queued?.name ?? null) : null,
    };
  }

  private async shownIdFor(program: ActiveProgram): Promise<string | null> {
    const queuedId = await this.ensureQueuedId(program);
    return shownWorkoutId(
      queuedId,
      program.overrideWorkoutId,
      program.workouts,
    );
  }

  private async ensureQueuedId(program: ActiveProgram): Promise<string | null> {
    const lastCompleted = await this.prisma.workoutSession.findFirst({
      where: {
        userId: program.userId,
        status: 'COMPLETED',
        workout: { programId: program.id },
      },
      orderBy: { startedAt: 'desc' },
      select: { workoutId: true },
    });
    const queuedId = queuedWorkoutId(
      program.workouts,
      program.nextWorkoutId,
      lastCompleted?.workoutId ?? null,
    );
    if (queuedId !== null && queuedId !== program.nextWorkoutId) {
      await this.prisma.program.update({
        where: { id: program.id },
        data: { nextWorkoutId: queuedId },
      });
      program.nextWorkoutId = queuedId;
    }
    return queuedId;
  }

  private async loadActiveProgram(currentUserId: string) {
    return this.prisma.program.findFirst({
      where: { userId: currentUserId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { workouts: { orderBy: { order: 'asc' } } },
    });
  }

  private async abandonOpenSessions(currentUserId: string): Promise<void> {
    await this.prisma.workoutSession.updateMany({
      where: { userId: currentUserId, status: 'IN_PROGRESS' },
      data: { status: 'ABANDONED' },
    });
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
