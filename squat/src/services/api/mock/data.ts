import { ids } from "@/services/api/mock/ids";
import type {
  Exercise,
  ExerciseProgress,
  PerformedSet,
  PersonalRecord,
  Program,
  SessionExercise,
  User,
  Workout,
  WorkoutExercise,
  WorkoutSession,
} from "@/types/domain";

export const currentUser: User = {
  id: ids.user,
  displayName: "Alex Rivera",
  email: "alex@squat.app",
  unit: "kg",
  themePreference: "system",
};

export const exercises: readonly Exercise[] = [
  {
    id: ids.exerciseBench,
    name: "Barbell Bench Press",
    muscleGroup: "chest",
    equipment: "barbell",
  },
  {
    id: ids.exerciseOhp,
    name: "Overhead Press",
    muscleGroup: "shoulders",
    equipment: "barbell",
  },
  {
    id: ids.exerciseRow,
    name: "Barbell Row",
    muscleGroup: "back",
    equipment: "barbell",
  },
  {
    id: ids.exerciseSquat,
    name: "Back Squat",
    muscleGroup: "quads",
    equipment: "barbell",
  },
  {
    id: ids.exerciseRdl,
    name: "Romanian Deadlift",
    muscleGroup: "hamstrings",
    equipment: "barbell",
  },
  {
    id: ids.exercisePullup,
    name: "Pull-Up",
    muscleGroup: "back",
    equipment: "bodyweight",
  },
];

export const programs: readonly Program[] = [
  {
    id: ids.program,
    userId: ids.user,
    name: "PPL Strength Block",
    description: "Six-day push / pull / legs with a strength emphasis.",
    workoutIds: [ids.workoutPush, ids.workoutPull, ids.workoutLegs],
  },
];

export const workouts: readonly Workout[] = [
  {
    id: ids.workoutPush,
    programId: ids.program,
    name: "Push A",
    notes: "Heavy bench, moderate press volume.",
  },
  {
    id: ids.workoutPull,
    programId: ids.program,
    name: "Pull A",
    notes: "Rows and vertical pulling.",
  },
  {
    id: ids.workoutLegs,
    programId: ids.program,
    name: "Legs A",
    notes: "Squat focus plus posterior chain.",
  },
];

export const workoutExercises: readonly WorkoutExercise[] = [
  {
    id: "we-push-1",
    workoutId: ids.workoutPush,
    exerciseId: ids.exerciseBench,
    order: 1,
    targetSets: 4,
    targetReps: { min: 4, max: 6 },
    targetWeightKg: 100,
    restSeconds: 180,
  },
  {
    id: "we-push-2",
    workoutId: ids.workoutPush,
    exerciseId: ids.exerciseOhp,
    order: 2,
    targetSets: 3,
    targetReps: 8,
    targetWeightKg: 55,
    restSeconds: 150,
  },
  {
    id: "we-pull-1",
    workoutId: ids.workoutPull,
    exerciseId: ids.exerciseRow,
    order: 1,
    targetSets: 4,
    targetReps: 6,
    targetWeightKg: 80,
    restSeconds: 150,
  },
  {
    id: "we-pull-2",
    workoutId: ids.workoutPull,
    exerciseId: ids.exercisePullup,
    order: 2,
    targetSets: 3,
    targetReps: { min: 6, max: 10 },
    targetWeightKg: null,
    restSeconds: 120,
  },
  {
    id: "we-legs-1",
    workoutId: ids.workoutLegs,
    exerciseId: ids.exerciseSquat,
    order: 1,
    targetSets: 5,
    targetReps: 5,
    targetWeightKg: 140,
    restSeconds: 180,
  },
  {
    id: "we-legs-2",
    workoutId: ids.workoutLegs,
    exerciseId: ids.exerciseRdl,
    order: 2,
    targetSets: 3,
    targetReps: 8,
    targetWeightKg: 100,
    restSeconds: 150,
  },
];

export const sessions: readonly WorkoutSession[] = [
  {
    id: ids.sessionCurrent,
    userId: ids.user,
    workoutId: ids.workoutPush,
    name: "Push A",
    status: "in_progress",
    startedAt: "2026-09-12T16:05:00.000Z",
    completedAt: null,
    durationMinutes: null,
    notes: null,
  },
  {
    id: ids.sessionRecent,
    userId: ids.user,
    workoutId: ids.workoutLegs,
    name: "Legs A",
    status: "completed",
    startedAt: "2026-09-10T17:00:00.000Z",
    completedAt: "2026-09-10T18:12:00.000Z",
    durationMinutes: 72,
    notes: "Squat felt strong.",
  },
];

export const sessionExercises: readonly SessionExercise[] = [
  {
    id: "se-today-bench",
    sessionId: ids.sessionCurrent,
    exerciseId: ids.exerciseBench,
    order: 1,
  },
  {
    id: "se-today-ohp",
    sessionId: ids.sessionCurrent,
    exerciseId: ids.exerciseOhp,
    order: 2,
  },
  {
    id: "se-recent-squat",
    sessionId: ids.sessionRecent,
    exerciseId: ids.exerciseSquat,
    order: 1,
  },
  {
    id: "se-recent-rdl",
    sessionId: ids.sessionRecent,
    exerciseId: ids.exerciseRdl,
    order: 2,
  },
];

export const performedSets: readonly PerformedSet[] = [
  {
    id: "set-today-1",
    sessionExerciseId: "se-today-bench",
    setNumber: 1,
    weightKg: 100,
    reps: 6,
    rpe: 7.5,
    completed: true,
    completedAt: "2026-09-12T16:12:00.000Z",
  },
  {
    id: "set-today-2",
    sessionExerciseId: "se-today-bench",
    setNumber: 2,
    weightKg: 100,
    reps: 5,
    rpe: 8,
    completed: true,
    completedAt: "2026-09-12T16:16:00.000Z",
  },
  {
    id: "set-today-3",
    sessionExerciseId: "se-today-bench",
    setNumber: 3,
    weightKg: 100,
    reps: null,
    rpe: null,
    completed: false,
    completedAt: null,
  },
  {
    id: "set-today-4",
    sessionExerciseId: "se-today-bench",
    setNumber: 4,
    weightKg: 100,
    reps: null,
    rpe: null,
    completed: false,
    completedAt: null,
  },
  {
    id: "set-today-ohp-1",
    sessionExerciseId: "se-today-ohp",
    setNumber: 1,
    weightKg: 55,
    reps: null,
    rpe: null,
    completed: false,
    completedAt: null,
  },
  {
    id: "set-recent-1",
    sessionExerciseId: "se-recent-squat",
    setNumber: 1,
    weightKg: 140,
    reps: 5,
    rpe: 8,
    completed: true,
    completedAt: "2026-09-10T17:20:00.000Z",
  },
  {
    id: "set-recent-2",
    sessionExerciseId: "se-recent-squat",
    setNumber: 2,
    weightKg: 140,
    reps: 5,
    rpe: 8.5,
    completed: true,
    completedAt: "2026-09-10T17:24:00.000Z",
  },
  {
    id: "set-recent-3",
    sessionExerciseId: "se-recent-rdl",
    setNumber: 1,
    weightKg: 100,
    reps: 8,
    rpe: 7,
    completed: true,
    completedAt: "2026-09-10T17:50:00.000Z",
  },
];

export const personalRecords: readonly PersonalRecord[] = [
  {
    id: "pr-squat",
    userId: ids.user,
    exerciseId: ids.exerciseSquat,
    weightKg: 150,
    reps: 5,
    estimated1RmKg: 169,
    achievedAt: "2026-08-28T18:00:00.000Z",
  },
  {
    id: "pr-bench",
    userId: ids.user,
    exerciseId: ids.exerciseBench,
    weightKg: 107.5,
    reps: 5,
    estimated1RmKg: 121,
    achievedAt: "2026-09-05T16:40:00.000Z",
  },
];

export const exerciseProgress: readonly ExerciseProgress[] = [
  {
    exerciseId: ids.exerciseSquat,
    points: [
      { date: "2026-07-01", estimated1RmKg: 155, volumeKg: 4200 },
      { date: "2026-07-15", estimated1RmKg: 158, volumeKg: 4450 },
      { date: "2026-08-01", estimated1RmKg: 162, volumeKg: 4600 },
      { date: "2026-08-15", estimated1RmKg: 166, volumeKg: 4800 },
      { date: "2026-09-01", estimated1RmKg: 169, volumeKg: 5100 },
    ],
  },
  {
    exerciseId: ids.exerciseBench,
    points: [
      { date: "2026-07-01", estimated1RmKg: 110, volumeKg: 2800 },
      { date: "2026-07-15", estimated1RmKg: 112, volumeKg: 2900 },
      { date: "2026-08-01", estimated1RmKg: 115, volumeKg: 3050 },
      { date: "2026-08-15", estimated1RmKg: 118, volumeKg: 3200 },
      { date: "2026-09-01", estimated1RmKg: 121, volumeKg: 3350 },
    ],
  },
];
