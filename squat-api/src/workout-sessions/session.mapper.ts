import type {
  Exercise,
  Set,
  SessionExercise,
  Workout,
  WorkoutExercise,
  WorkoutSession,
} from '@prisma/client';
import {
  decimalToNumber,
  toApiSessionStatus,
} from '../common/domain-map.js';
import { toWorkoutExerciseDto } from '../workouts/workout.mapper.js';
import type {
  SessionExerciseResponseDto,
  SetResponseDto,
  WorkoutSessionResponseDto,
} from './dto/session-response.dto.js';

type SessionGraph = WorkoutSession & {
  workout: Workout;
  exercises: (SessionExercise & {
    exercise: Exercise;
    workoutExercise: WorkoutExercise & { exercise: Exercise };
    sets: Set[];
  })[];
};

function toSetDto(set: Set): SetResponseDto {
  return {
    id: set.id,
    setNumber: set.setNumber,
    weightKg: decimalToNumber(set.weightKg),
    reps: set.reps,
    rpe: decimalToNumber(set.rpe),
    completed: set.completedAt !== null,
    completedAt: set.completedAt?.toISOString() ?? null,
  };
}

function toSessionExerciseDto(
  item: SessionGraph['exercises'][number],
): SessionExerciseResponseDto {
  return {
    id: item.id,
    order: item.order,
    exercise: toWorkoutExerciseDto(item.workoutExercise).exercise,
    prescription: toWorkoutExerciseDto(item.workoutExercise),
    sets: item.sets
      .slice()
      .sort((a, b) => a.setNumber - b.setNumber)
      .map(toSetDto),
  };
}

export function toSessionDto(session: SessionGraph): WorkoutSessionResponseDto {
  return {
    id: session.id,
    workoutId: session.workoutId,
    name: session.workout.name,
    status: toApiSessionStatus(session.status),
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    exercises: session.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(toSessionExerciseDto),
  };
}
