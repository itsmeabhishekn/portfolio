import type {
  Exercise,
  Program,
  Workout,
  WorkoutExercise,
} from '@prisma/client';
import {
  decimalToNumber,
  estimateWorkoutMinutes,
  toApiEquipment,
  toApiMuscleGroup,
  uniqueMuscleGroups,
} from '../common/domain-map.js';
import type {
  ExerciseResponseDto,
  WorkoutExerciseResponseDto,
  WorkoutSummaryDto,
  WorkoutTemplateResponseDto,
} from './dto/workout-response.dto.js';
import type { UpcomingSource } from './rotation.js';

type WorkoutWithRelations = Workout & {
  program: Program;
  workoutExercises: (WorkoutExercise & { exercise: Exercise })[];
};

export function toExerciseDto(exercise: Exercise): ExerciseResponseDto {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    primaryMuscleGroup: toApiMuscleGroup(exercise.primaryMuscleGroup),
    secondaryMuscleGroups: exercise.secondaryMuscleGroups.map(toApiMuscleGroup),
    equipment: toApiEquipment(exercise.equipment),
    catalogKey: exercise.catalogKey ?? null,
    region: exercise.region ?? null,
    focus: exercise.focus ?? null,
    targetSubdivision: exercise.targetSubdivision ?? null,
    movementPattern: exercise.movementPattern ?? null,
    mechanics: exercise.mechanics ?? null,
    aclFriendly: exercise.aclFriendly ?? null,
    shoulderImpingementRisk: exercise.shoulderImpingementRisk ?? null,
  };
}

export function toWorkoutExerciseDto(
  item: WorkoutExercise & { exercise: Exercise },
): WorkoutExerciseResponseDto {
  return {
    id: item.id,
    order: item.order,
    targetSets: item.targetSets,
    repMin: item.repMin,
    repMax: item.repMax,
    targetWeightKg: decimalToNumber(item.targetWeightKg),
    restSeconds: item.restSeconds,
    exercise: toExerciseDto(item.exercise),
  };
}

export function toWorkoutSummaryDto(
  workout: WorkoutWithRelations,
  inProgress: boolean,
): WorkoutSummaryDto {
  const muscleGroups = uniqueMuscleGroups(
    workout.workoutExercises.map((item) =>
      toApiMuscleGroup(item.exercise.primaryMuscleGroup),
    ),
  );

  return {
    id: workout.id,
    name: workout.name,
    notes: workout.notes,
    order: workout.order,
    program: {
      id: workout.program.id,
      name: workout.program.name,
      description: workout.program.description,
    },
    muscleGroups,
    exerciseCount: workout.workoutExercises.length,
    estimatedMinutes: estimateWorkoutMinutes(workout.workoutExercises),
    inProgress,
  };
}

export function toWorkoutTemplateDto(
  workout: WorkoutWithRelations,
  inProgress: boolean,
  upcoming?: {
    source: UpcomingSource;
    queuedName: string | null;
    isUpcoming: boolean;
  },
): WorkoutTemplateResponseDto {
  const summary = toWorkoutSummaryDto(workout, inProgress);
  return {
    ...summary,
    exercises: workout.workoutExercises.map(toWorkoutExerciseDto),
    source: upcoming?.source,
    queuedName: upcoming?.queuedName ?? null,
    isUpcoming: upcoming?.isUpcoming ?? false,
  };
}
