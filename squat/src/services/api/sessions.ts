import { apiRequest, notFound } from "@/services/api/client";
import { parseSessionDetail, type SessionDetail } from "@/services/api/map";
import { getUpcomingWorkoutDetail } from "@/services/api/workouts";
import type {
  PerformedSet,
  SessionExercise,
  WorkoutHistoryItem,
  WorkoutSession,
} from "@/types/domain";

export type { SessionDetail };

const sessionCache = new Map<string, SessionDetail>();

function cacheSession(detail: SessionDetail): SessionDetail {
  sessionCache.set(detail.session.id, detail);
  return detail;
}

export async function getSessionDetail(
  sessionId: string,
): Promise<SessionDetail> {
  const detail = await apiRequest(`/workout-sessions/${sessionId}`, {
    parse: parseSessionDetail,
  });
  return cacheSession(detail);
}

export async function getInProgressForWorkout(
  workoutId: string,
): Promise<WorkoutSession | null> {
  const detail = await apiRequest(
    `/workouts/${workoutId}/sessions/in-progress`,
    {
      parse: parseSessionDetail,
      notFoundValue: null,
    },
  );
  if (!detail) {
    return null;
  }
  return cacheSession(detail).session;
}

export async function startWorkout(workoutId: string): Promise<WorkoutSession> {
  const detail = await apiRequest(`/workouts/${workoutId}/sessions`, {
    method: "POST",
    parse: parseSessionDetail,
  });
  return cacheSession(detail).session;
}

export interface UpdateSetInput {
  weightKg?: number;
  reps?: number;
  rpe?: number | null;
  completed?: boolean;
}

export async function updateSet(
  sessionId: string,
  setId: string,
  input: UpdateSetInput,
): Promise<SessionDetail> {
  const detail = await apiRequest(
    `/workout-sessions/${sessionId}/sets/${setId}`,
    {
      method: "PATCH",
      body: input,
      parse: parseSessionDetail,
    },
  );
  return cacheSession(detail);
}

export async function completeSession(
  sessionId: string,
): Promise<SessionDetail> {
  const detail = await apiRequest(`/workout-sessions/${sessionId}/complete`, {
    method: "POST",
    parse: parseSessionDetail,
  });
  return cacheSession(detail);
}

export async function getActiveSessionId(): Promise<string | null> {
  const upcoming = await getUpcomingWorkoutDetail();
  if (!upcoming?.inProgress) {
    return null;
  }
  const session = await getInProgressForWorkout(upcoming.workout.id);
  return session?.id ?? null;
}

export async function getWorkoutTabTarget(): Promise<{
  activeSessionId: string | null;
  upcomingWorkoutId: string | null;
}> {
  const upcoming = await getUpcomingWorkoutDetail();
  if (!upcoming) {
    return { activeSessionId: null, upcomingWorkoutId: null };
  }
  if (!upcoming.inProgress) {
    return {
      activeSessionId: null,
      upcomingWorkoutId: upcoming.workout.id,
    };
  }
  const session = await getInProgressForWorkout(upcoming.workout.id);
  return {
    activeSessionId: session?.id ?? null,
    upcomingWorkoutId: upcoming.workout.id,
  };
}

export function listSessions(): Promise<readonly WorkoutSession[]> {
  return Promise.resolve([]);
}

export async function getSession(sessionId: string): Promise<WorkoutSession> {
  return (await getSessionDetail(sessionId)).session;
}

export async function listSessionExercises(
  sessionId: string,
): Promise<readonly SessionExercise[]> {
  const detail = await getSessionDetail(sessionId);
  return detail.blocks.map((block) => block.item);
}

export async function listSets(
  sessionExerciseId: string,
): Promise<readonly PerformedSet[]> {
  for (const detail of sessionCache.values()) {
    const block = detail.blocks.find(
      (item) => item.item.id === sessionExerciseId,
    );
    if (block) {
      return block.sets;
    }
  }
  throw notFound("Set group", sessionExerciseId);
}

export function listHistory(): Promise<readonly WorkoutHistoryItem[]> {
  return Promise.resolve([]);
}
