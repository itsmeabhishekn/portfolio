import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ApiSessionStatus } from '../../common/domain-map.js';
import {
  ExerciseResponseDto,
  WorkoutExerciseResponseDto,
} from '../../workouts/dto/workout-response.dto.js';

export class SetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  setNumber: number;

  @ApiPropertyOptional()
  weightKg: number | null;

  @ApiPropertyOptional()
  reps: number | null;

  @ApiPropertyOptional()
  rpe: number | null;

  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  completedAt: string | null;
}

export class SessionExerciseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: ExerciseResponseDto })
  exercise: ExerciseResponseDto;

  @ApiProperty({ type: WorkoutExerciseResponseDto })
  prescription: WorkoutExerciseResponseDto;

  @ApiProperty({ type: [SetResponseDto] })
  sets: SetResponseDto[];
}

export class WorkoutSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workoutId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: 'in_progress' })
  status: ApiSessionStatus;

  @ApiProperty()
  startedAt: string;

  @ApiPropertyOptional()
  completedAt: string | null;

  @ApiProperty({ type: [SessionExerciseResponseDto] })
  exercises: SessionExerciseResponseDto[];
}
