import { api } from "@/services/api";
import type {
  MuscleGroup,
  Program,
  User,
  Workout,
  WorkoutHistoryItem,
} from "@/types/domain";
import { completedWorkoutStreak } from "@/lib/workoutMeta";

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
  const [user, todayDetail, history, records, series] = await Promise.all([
    api.auth.getCurrentUser(),
    api.workouts.getUpcomingWorkoutDetail(),
    api.sessions.listHistory(),
    api.progress.listPersonalRecords(),
    api.progress.listExerciseProgress(),
  ]);

  if (!user) {
    throw new Error("Not signed in.");
  }

  const today: TodayWorkoutView | null = todayDetail
    ? {
        workout: todayDetail.workout,
        program: todayDetail.program,
        muscleGroups: todayDetail.muscleGroups,
        exerciseCount: todayDetail.exerciseCount,
        estimatedMinutes: todayDetail.estimatedMinutes,
        inProgress: todayDetail.inProgress,
      }
    : null;

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
