import { api } from "@/services/api";
import type { UpcomingSource } from "@/services/api/map";
import type {
  MuscleGroup,
  Program,
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
  source: UpcomingSource | null;
  queuedName: string | null;
}

export interface ProgressPrView {
  exerciseName: string;
  weightKg: number;
  reps: number;
  deltaKg: number | null;
}

export interface DashboardData {
  today: TodayWorkoutView | null;
  recent: WorkoutHistoryItem | null;
  pr: ProgressPrView | null;
  streak: number;
}

export async function loadDashboard(): Promise<DashboardData> {
  const todayDetail = await api.workouts.getUpcomingWorkoutDetail();

  return {
    today: todayDetail
      ? {
          workout: todayDetail.workout,
          program: todayDetail.program,
          muscleGroups: todayDetail.muscleGroups,
          exerciseCount: todayDetail.exerciseCount,
          estimatedMinutes: todayDetail.estimatedMinutes,
          inProgress: todayDetail.inProgress,
          source: todayDetail.source,
          queuedName: todayDetail.queuedName,
        }
      : null,
    recent: null,
    pr: null,
    streak: 0,
  };
}
