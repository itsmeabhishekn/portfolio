import * as auth from "@/services/api/auth";
import * as exercises from "@/services/api/exercises";
import * as programs from "@/services/api/programs";
import * as progress from "@/services/api/progress";
import * as sessions from "@/services/api/sessions";
import * as workouts from "@/services/api/workouts";

export const api = {
  auth,
  programs,
  workouts,
  exercises,
  sessions,
  progress,
} as const;

export type Api = typeof api;
