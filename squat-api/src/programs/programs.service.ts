import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type {
  ProgramDetailDto,
  ProgramListItemDto,
} from '../workouts/dto/workout-response.dto.js';
import { toWorkoutSummaryDto } from '../workouts/workout.mapper.js';

const programWorkoutInclude = {
  program: true,
  workoutExercises: {
    include: { exercise: true },
    orderBy: { order: 'asc' as const },
  },
};

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(currentUserId: string): Promise<ProgramListItemDto[]> {
    const programs = await this.prisma.program.findMany({
      where: { userId: currentUserId },
      include: { _count: { select: { workouts: true } } },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return programs.map((program) => ({
      id: program.id,
      name: program.name,
      description: program.description,
      isActive: program.isActive,
      workoutCount: program._count.workouts,
    }));
  }

  async getById(
    programId: string,
    currentUserId: string,
  ): Promise<ProgramDetailDto> {
    const program = await this.prisma.program.findFirst({
      where: { id: programId, userId: currentUserId },
      include: {
        workouts: {
          include: programWorkoutInclude,
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId: currentUserId, status: 'IN_PROGRESS' },
      select: { workoutId: true },
    });
    const inProgressIds = new Set(sessions.map((row) => row.workoutId));

    return {
      id: program.id,
      name: program.name,
      description: program.description,
      isActive: program.isActive,
      workouts: program.workouts.map((workout) =>
        toWorkoutSummaryDto(workout, inProgressIds.has(workout.id)),
      ),
    };
  }
}
