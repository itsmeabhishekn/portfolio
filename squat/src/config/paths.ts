export const paths = {
  root: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  programs: "/programs",
  program: (programId: string) => `/programs/${programId}`,
  workoutTemplate: (workoutId: string) => `/workouts/${workoutId}`,
  workoutSession: (sessionId: string) => `/workout/${sessionId}`,
  exercises: "/exercises",
  exercise: (exerciseId: string) => `/exercises/${exerciseId}`,
  progress: "/progress",
  history: "/history",
  profile: "/profile",
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
