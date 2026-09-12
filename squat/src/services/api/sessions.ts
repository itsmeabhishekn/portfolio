import { notFound } from "@/services/api/client";
import { currentUser, exercises } from "@/services/api/mock/data";
import { store } from "@/services/api/mock/store";
import {
  getWorkout,
  listWorkoutExercises,
} from "@/services/api/workouts";
import type {
  PerformedSet,
  SessionExercise,
  WorkoutHistoryItem,
  WorkoutSession,
} from "@/types/domain";

function historyFromStore(): readonly WorkoutHistoryItem[] {
  const completed = store.sessions
    .filter((session) => session.status === "completed")
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return completed.map((session) => {
    const sessionExs = store.sessionExercises.filter(
      (item) => item.sessionId === session.id,
    );
    const exerciseNames = sessionExs.map((item) => {
      const exercise = exercises.find((entry) => entry.id === item.exerciseId);
      return exercise?.name ?? "Exercise";
    });
    const sets = store.performedSets.filter((set) =>
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

export function getActiveSessionId(): string | null {
  const active = store.sessions
    .filter((session) => session.status === "in_progress")
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  return active?.id ?? null;
}

export function getInProgressForWorkout(
  workoutId: string,
): Promise<WorkoutSession | null> {
  const session =
    store.sessions.find(
      (item) => item.status === "in_progress" && item.workoutId === workoutId,
    ) ?? null;
  return Promise.resolve(session);
}

export function listSessions(): Promise<readonly WorkoutSession[]> {
  return Promise.resolve(store.sessions.slice());
}

export function getSession(sessionId: string): Promise<WorkoutSession> {
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) {
    return Promise.reject(notFound("Workout session", sessionId));
  }
  return Promise.resolve(session);
}

export function listSessionExercises(
  sessionId: string,
): Promise<readonly SessionExercise[]> {
  return Promise.resolve(
    store.sessionExercises
      .filter((item) => item.sessionId === sessionId)
      .slice()
      .sort((a, b) => a.order - b.order),
  );
}

export function listSets(
  sessionExerciseId: string,
): Promise<readonly PerformedSet[]> {
  return Promise.resolve(
    store.performedSets
      .filter((item) => item.sessionExerciseId === sessionExerciseId)
      .slice()
      .sort((a, b) => a.setNumber - b.setNumber),
  );
}

export function listHistory(): Promise<readonly WorkoutHistoryItem[]> {
  return Promise.resolve(historyFromStore());
}

export async function startWorkout(workoutId: string): Promise<WorkoutSession> {
  const existing = await getInProgressForWorkout(workoutId);
  if (existing) {
    return existing;
  }

  const workout = await getWorkout(workoutId);
  const template = await listWorkoutExercises(workoutId);
  const session: WorkoutSession = {
    id: crypto.randomUUID(),
    userId: currentUser.id,
    workoutId: workout.id,
    name: workout.name,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMinutes: null,
    notes: null,
  };

  store.sessions.push(session);

  for (const item of template) {
    const sessionExercise: SessionExercise = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      exerciseId: item.exerciseId,
      order: item.order,
    };
    store.sessionExercises.push(sessionExercise);

    for (let setNumber = 1; setNumber <= item.targetSets; setNumber += 1) {
      const performed: PerformedSet = {
        id: crypto.randomUUID(),
        sessionExerciseId: sessionExercise.id,
        setNumber,
        weightKg: item.targetWeightKg,
        reps: null,
        rpe: null,
        completed: false,
        completedAt: null,
      };
      store.performedSets.push(performed);
    }
  }

  return session;
}
