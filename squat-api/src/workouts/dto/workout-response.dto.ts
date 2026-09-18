import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ApiEquipment, ApiMuscleGroup } from '../../common/domain-map.js';

export class ExerciseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ example: 'chest' })
  primaryMuscleGroup: ApiMuscleGroup;

  @ApiProperty({ type: [String], example: ['triceps'] })
  secondaryMuscleGroups: ApiMuscleGroup[];

  @ApiProperty({ example: 'barbell' })
  equipment: ApiEquipment;

  @ApiPropertyOptional()
  catalogKey: string | null;

  @ApiPropertyOptional()
  region: string | null;

  @ApiPropertyOptional()
  focus: string | null;

  @ApiPropertyOptional()
  targetSubdivision: string | null;

  @ApiPropertyOptional()
  movementPattern: string | null;

  @ApiPropertyOptional()
  mechanics: string | null;

  @ApiPropertyOptional()
  aclFriendly: boolean | null;

  @ApiPropertyOptional()
  shoulderImpingementRisk: string | null;
}

export class ProgramSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}

export class WorkoutSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: ProgramSummaryDto })
  program: ProgramSummaryDto;

  @ApiProperty({ type: [String] })
  muscleGroups: ApiMuscleGroup[];

  @ApiProperty()
  exerciseCount: number;

  @ApiProperty()
  estimatedMinutes: number;

  @ApiProperty()
  inProgress: boolean;
}

export class ProgramListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  workoutCount: number;
}

export class ProgramDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [WorkoutSummaryDto] })
  workouts: WorkoutSummaryDto[];
}

export class WorkoutExerciseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  targetSets: number;

  @ApiProperty()
  repMin: number;

  @ApiProperty()
  repMax: number;

  @ApiPropertyOptional()
  targetWeightKg: number | null;

  @ApiProperty()
  restSeconds: number;

  @ApiProperty({ type: ExerciseResponseDto })
  exercise: ExerciseResponseDto;
}

export class WorkoutTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: ProgramSummaryDto })
  program: ProgramSummaryDto;

  @ApiProperty({ type: [String] })
  muscleGroups: ApiMuscleGroup[];

  @ApiProperty()
  exerciseCount: number;

  @ApiProperty()
  estimatedMinutes: number;

  @ApiProperty()
  inProgress: boolean;

  @ApiProperty({ type: [WorkoutExerciseResponseDto] })
  exercises: WorkoutExerciseResponseDto[];

  @ApiPropertyOptional({
    enum: ['in_progress', 'rotation', 'override'],
  })
  source?: 'in_progress' | 'rotation' | 'override';

  @ApiPropertyOptional()
  queuedName?: string | null;

  @ApiPropertyOptional()
  isUpcoming?: boolean;
}
