import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { decimalToNumber } from '../common/domain-map.js';
import { PrismaService } from '../database/prisma.service.js';
import { WorkoutsService } from '../workouts/workouts.service.js';
import type { UpdateSetDto } from './dto/update-set.dto.js';
import type { WorkoutSessionResponseDto } from './dto/session-response.dto.js';
import { toSessionDto } from './session.mapper.js';

const sessionInclude = {
  workout: true,
  exercises: {
    orderBy: { order: 'asc' as const },
    include: {
      exercise: true,
      workoutExercise: { include: { exercise: true } },
      sets: { orderBy: { setNumber: 'asc' as const } },
    },
  },
} satisfies Prisma.WorkoutSessionInclude;

@Injectable()
export class WorkoutSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => WorkoutsService))
    private readonly workouts: WorkoutsService,
  ) {}

  async getById(
    sessionId: string,
    currentUserId: string,
  ): Promise<WorkoutSessionResponseDto> {
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId: currentUserId },
      include: sessionInclude,
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    return toSessionDto(session);
  }

  async getInProgress(
    workoutId: string,
    currentUserId: string,
  ): Promise<WorkoutSessionResponseDto> {
    await this.workouts.assertOwned(workoutId, currentUserId);

    const session = await this.prisma.workoutSession.findFirst({
      where: {
        userId: currentUserId,
        workoutId,
        status: 'IN_PROGRESS',
      },
      include: sessionInclude,
    });

    if (!session) {
      throw new NotFoundException('No in-progress session');
    }

    return toSessionDto(session);
  }

  async startOrResume(
    workoutId: string,
    currentUserId: string,
  ): Promise<WorkoutSessionResponseDto> {
    await this.workouts.assertOwned(workoutId, currentUserId);

    const existing = await this.prisma.workoutSession.findFirst({
      where: {
        userId: currentUserId,
        workoutId,
        status: 'IN_PROGRESS',
      },
      include: sessionInclude,
    });

    if (existing) {
      return toSessionDto(existing);
    }

    try {
      const sessionId = await this.createSessionTransaction(
        workoutId,
        currentUserId,
      );
      return this.getById(sessionId, currentUserId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.getInProgress(workoutId, currentUserId);
      }
      throw error;
    }
  }

  async updateSet(
    sessionId: string,
    setId: string,
    currentUserId: string,
    dto: UpdateSetDto,
  ): Promise<WorkoutSessionResponseDto> {
    const row = await this.prisma.set.findFirst({
      where: {
        id: setId,
        sessionExercise: {
          sessionId,
          session: { userId: currentUserId },
        },
      },
      include: {
        sessionExercise: { include: { session: true } },
      },
    });

    if (!row) {
      throw new NotFoundException('Set not found');
    }

    if (row.sessionExercise.session.status !== 'IN_PROGRESS') {
      throw new ConflictException('Workout session is not in progress');
    }

    const nextWeight =
      dto.weightKg !== undefined ? dto.weightKg : decimalToNumber(row.weightKg);
    const nextReps = dto.reps !== undefined ? dto.reps : row.reps;

    if (dto.completed === true && (nextWeight === null || nextReps === null)) {
      throw new BadRequestException(
        'Weight and reps are required to complete a set',
      );
    }

    await this.prisma.set.update({
      where: { id: row.id },
      data: {
        ...(dto.weightKg !== undefined ? { weightKg: dto.weightKg } : {}),
        ...(dto.reps !== undefined ? { reps: dto.reps } : {}),
        ...(dto.rpe !== undefined ? { rpe: dto.rpe } : {}),
        ...(dto.completed === true
          ? { completedAt: row.completedAt ?? new Date() }
          : {}),
        ...(dto.completed === false ? { completedAt: null } : {}),
      },
    });

    return this.getById(sessionId, currentUserId);
  }

  async complete(
    sessionId: string,
    currentUserId: string,
  ): Promise<WorkoutSessionResponseDto> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.workoutSession.findFirst({
        where: { id: sessionId, userId: currentUserId },
        include: {
          exercises: { include: { sets: true } },
        },
      });

      if (!session) {
        throw new NotFoundException('Workout session not found');
      }

      if (session.status === 'COMPLETED') {
        return;
      }

      if (session.status !== 'IN_PROGRESS') {
        throw new ConflictException('Workout session is not in progress');
      }

      const sets = session.exercises.flatMap((item) => item.sets);
      if (sets.length === 0 || sets.some((set) => set.completedAt === null)) {
        throw new BadRequestException(
          'Complete all sets before finishing this workout',
        );
      }

      await tx.workoutSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
      await this.workouts.advanceAfterComplete(
        tx,
        currentUserId,
        session.workoutId,
      );
    });

    return this.getById(sessionId, currentUserId);
  }

  private async createSessionTransaction(
    workoutId: string,
    currentUserId: string,
  ): Promise<string> {
    const template = await this.prisma.workoutExercise.findMany({
      where: { workoutId },
      orderBy: { order: 'asc' },
    });

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.workoutSession.create({
        data: {
          userId: currentUserId,
          workoutId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      for (const item of template) {
        const sessionExercise = await tx.sessionExercise.create({
          data: {
            sessionId: session.id,
            workoutExerciseId: item.id,
            exerciseId: item.exerciseId,
            order: item.order,
          },
        });

        if (item.targetSets > 0) {
          await tx.set.createMany({
            data: Array.from({ length: item.targetSets }, (_, index) => ({
              sessionExerciseId: sessionExercise.id,
              setNumber: index + 1,
              weightKg: item.targetWeightKg,
            })),
          });
        }
      }

      return session.id;
    });
  }
}
