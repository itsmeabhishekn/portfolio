import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import type { ExerciseResponseDto } from '../workouts/dto/workout-response.dto.js';
import { toExerciseDto } from '../workouts/workout.mapper.js';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ExerciseResponseDto[]> {
    const rows = await this.prisma.exercise.findMany({
      orderBy: [{ region: 'asc' }, { focus: 'asc' }, { name: 'asc' }],
    });
    return rows.map(toExerciseDto);
  }

  async getById(exerciseId: string): Promise<ExerciseResponseDto> {
    const row = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!row) {
      throw new NotFoundException('Exercise not found');
    }
    return toExerciseDto(row);
  }
}
