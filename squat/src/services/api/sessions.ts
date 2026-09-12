import { notFound } from "@/services/api/client";
import { ids } from "@/services/api/mock/ids";
import {
  exercises,
  performedSets,
  sessionExercises,
  sessions,
} from "@/services/api/mock/data";
import type {
  PerformedSet,
  SessionExercise,
  WorkoutHistoryItem,
  WorkoutSession,
} from "@/types/domain";

export function getActiveSessionId(): string {
  return ids.sessionCurrent;
}

export function listSessions(): Promise<readonly WorkoutSession[]> {
  return Promise.resolve(sessions);
}

export function getSession(sessionId: string): Promise<WorkoutSession> {
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    return Promise.reject(notFound("Workout session", sessionId));
  }
  return Promise.resolve(session);
}

export function listSessionExercises(
  sessionId: string,
): Promise<readonly SessionExercise[]> {
  return Promise.resolve(
    sessionExercises
      .filter((item) => item.sessionId === sessionId)
      .slice()
      .sort((a, b) => a.order - b.order),
  );
}

export function listSets(sessionExerciseId: string): Promise<readonly PerformedSet[]> {
  return Promise.resolve(
    performedSets
      .filter((item) => item.sessionExerciseId === sessionExerciseId)
      .slice()
      .sort((a, b) => a.setNumber - b.setNumber),
  );
}

export async function listHistory(): Promise<readonly WorkoutHistoryItem[]> {
  const completed = sessions
    .filter((session) => session.status === "completed")
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return completed.map((session) => {
    const sessionExs = sessionExercises.filter(
      (item) => item.sessionId === session.id,
    );
    const exerciseNames = sessionExs.map((item) => {
      const exercise = exercises.find((entry) => entry.id === item.exerciseId);
      return exercise?.name ?? "Exercise";
    });
    const sets = performedSets.filter((set) =>
      sessionExs.some((item) => item.id === set.sessionExerciseId),
    );
    const volumeKg = sets.reduce((sum, set) => {
      if (!set.completed || set.weightKg == null || set.reps == null) {
        return sum;
      }
      return sum + set.weightKg * set.reps;
    }, 0);

    return {
      session,
      exerciseNames,
      volumeKg,
      setCount: sets.filter((set) => set.completed).length,
    };
  });
}
