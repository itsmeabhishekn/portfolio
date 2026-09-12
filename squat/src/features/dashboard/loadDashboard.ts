import { api } from "@/services/api";
import {
  completedWorkoutStreak,
  estimateWorkoutMinutes,
  muscleGroupsFromExercises,
} from "@/lib/workoutMeta";
import type {
  Exercise,
  MuscleGroup,
  Program,
  User,
  Workout,
  WorkoutHistoryItem,
} from "@/types/domain";

export interface TodayWorkoutView {
  workout: Workout;
  program: Program;
  muscleGroups: readonly MuscleGroup[];
  exerciseCount: number;
  estimatedMinutes: number;
  inProgress: boolean;
}

export interface ProgressPrView {
  exerciseName: string;
  weightKg: number;
  reps: number;
  deltaKg: number | null;
}

export interface DashboardData {
  user: User;
  today: TodayWorkoutView | null;
  recent: WorkoutHistoryItem | null;
  pr: ProgressPrView | null;
  streak: number;
}

export async function loadDashboard(): Promise<DashboardData> {
  const [user, workout, history, records, series] = await Promise.all([
    api.auth.getCurrentUser(),
    api.workouts.getUpcomingWorkout(),
    api.sessions.listHistory(),
    api.progress.listPersonalRecords(),
    api.progress.listExerciseProgress(),
  ]);

  if (!user) {
    throw new Error("Not signed in.");
  }

  let today: TodayWorkoutView | null = null;

  if (workout) {
    const [program, items, inProgress] = await Promise.all([
      api.programs.getProgram(workout.programId),
      api.workouts.listWorkoutExercises(workout.id),
      api.sessions.getInProgressForWorkout(workout.id),
    ]);
    const catalog: Exercise[] = [];
    for (const item of items) {
      catalog.push(await api.exercises.getExercise(item.exerciseId));
    }

    today = {
      workout,
      program,
      muscleGroups: muscleGroupsFromExercises(catalog),
      exerciseCount: items.length,
      estimatedMinutes: estimateWorkoutMinutes(items),
      inProgress: inProgress !== null,
    };
  }

  const latestRecord = records
    .slice()
    .sort((a, b) => b.achievedAt.localeCompare(a.achievedAt))[0];

  let pr: ProgressPrView | null = null;

  if (latestRecord) {
    const exercise = await api.exercises.getExercise(latestRecord.exerciseId);
    const points = series.find(
      (entry) => entry.exerciseId === latestRecord.exerciseId,
    )?.points;
    const latest = points?.at(-1)?.estimated1RmKg;
    const previous = points?.at(-2)?.estimated1RmKg;
    const deltaKg =
      latest != null && previous != null
        ? Number((latest - previous).toFixed(1))
        : null;

    pr = {
      exerciseName: exercise.name,
      weightKg: latestRecord.weightKg,
      reps: latestRecord.reps,
      deltaKg,
    };
  }

  return {
    user,
    today,
    recent: history[0] ?? null,
    pr,
    streak: completedWorkoutStreak(history.map((item) => item.session.startedAt)),
  };
}
