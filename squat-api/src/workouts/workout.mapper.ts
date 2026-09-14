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
  WorkoutTemplateResponseDto,
} from './dto/workout-response.dto.js';

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

export function toWorkoutTemplateDto(
  workout: WorkoutWithRelations,
  inProgress: boolean,
): WorkoutTemplateResponseDto {
  const exercises = workout.workoutExercises.map(toWorkoutExerciseDto);
  const muscleGroups = uniqueMuscleGroups(
    exercises.map((item) => item.exercise.primaryMuscleGroup),
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
    exerciseCount: exercises.length,
    estimatedMinutes: estimateWorkoutMinutes(workout.workoutExercises),
    inProgress,
    exercises,
  };
}
