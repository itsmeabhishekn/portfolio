import {
  performedSets as seedSets,
  sessionExercises as seedSessionExercises,
  sessions as seedSessions,
} from "@/services/api/mock/data";
import type {
  PerformedSet,
  SessionExercise,
  WorkoutSession,
} from "@/types/domain";

export const store: {
  sessions: WorkoutSession[];
  sessionExercises: SessionExercise[];
  performedSets: PerformedSet[];
} = {
  sessions: seedSessions.map((item) => ({ ...item })),
  sessionExercises: seedSessionExercises.map((item) => ({ ...item })),
  performedSets: seedSets.map((item) => ({ ...item })),
};
