export type WeightUnit = "kg" | "lb";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "adductors"
  | "calves"
  | "arms"
  | "core"
  | "full_body";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "other";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export type ThemePreference = "light" | "dark" | "system";

export type Rpe =
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 4.5
  | 5
  | 5.5
  | 6
  | 6.5
  | 7
  | 7.5
  | 8
  | 8.5
  | 9
  | 9.5
  | 10;

export type RepTarget = number | { min: number; max: number };

export interface User {
  id: string;
  displayName: string;
  email: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  region: string | null;
  focus: string | null;
  targetSubdivision: string | null;
}

export interface Program {
  id: string;
  userId: string;
  name: string;
  description: string;
  isActive: boolean;
  workoutIds: readonly string[];
}

export interface ProgramListItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  workoutCount: number;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  notes: string | null;
  order: number;
  programId: string;
  programName: string;
  muscleGroups: readonly MuscleGroup[];
  exerciseCount: number;
  estimatedMinutes: number;
  inProgress: boolean;
}

export interface Workout {
  id: string;
  programId: string;
  name: string;
  notes: string | null;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: RepTarget;
  targetWeightKg: number | null;
  restSeconds: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string | null;
  name: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  order: number;
}

export interface PerformedSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  rpe: Rpe | null;
  completed: boolean;
  completedAt: string | null;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  estimated1RmKg: number;
  achievedAt: string;
}

export interface ProgressPoint {
  date: string;
  estimated1RmKg: number;
  volumeKg: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  points: readonly ProgressPoint[];
}

export interface WorkoutHistoryItem {
  session: WorkoutSession;
  exerciseNames: readonly string[];
  volumeKg: number;
  setCount: number;
}
