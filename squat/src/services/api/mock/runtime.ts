import { ApiError, notFound } from "@/services/api/client";
import {
  exercises,
  programs,
  workoutExercises,
  workouts,
} from "@/services/api/mock/data";
import { store } from "@/services/api/mock/store";
import type { SessionDetail, WorkoutDetail } from "@/services/api/map";
import {
  estimateWorkoutMinutes,
  muscleGroupsFromExercises,
} from "@/lib/workoutMeta";
import type {
  PerformedSet,
  Rpe,
  SessionExercise,
  Workout,
  WorkoutExercise,
  WorkoutSession,
} from "@/types/domain";

interface UpdateSetInput {
  weightKg?: number;
  reps?: number;
  rpe?: number | null;
  completed?: boolean;
}

const STORAGE_KEY = "squat.mock-store.v1";

function persist(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sessions: store.sessions,
      sessionExercises: store.sessionExercises,
      performedSets: store.performedSets,
    }),
  );
}

function hydrate(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray(Reflect.get(parsed, "sessions")) ||
      !Array.isArray(Reflect.get(parsed, "sessionExercises")) ||
      !Array.isArray(Reflect.get(parsed, "performedSets"))
    ) {
      return;
    }
    const record = parsed as {
      sessions: WorkoutSession[];
      sessionExercises: SessionExercise[];
      performedSets: PerformedSet[];
    };
    store.sessions = record.sessions;
    store.sessionExercises = record.sessionExercises;
    store.performedSets = record.performedSets;
  } catch {
    // Keep the seeded in-memory store.
  }
}

hydrate();

function requireWorkout(workoutId: string): Workout {
  const workout = workouts.find((item) => item.id === workoutId);
  if (!workout) {
    throw notFound("Workout", workoutId);
  }
  return workout;
}

function requireExercise(exerciseId: string) {
  const exercise = exercises.find((item) => item.id === exerciseId);
  if (!exercise) {
    throw notFound("Exercise", exerciseId);
  }
  return exercise;
}

function itemsForWorkout(workoutId: string): WorkoutExercise[] {
  return workoutExercises
    .filter((item) => item.workoutId === workoutId)
    .slice()
    .sort((a, b) => a.order - b.order);
}

function inProgressFor(workoutId: string): WorkoutSession | undefined {
  return store.sessions.find(
    (session) =>
      session.workoutId === workoutId && session.status === "in_progress",
  );
}

function toWorkoutDetail(workout: Workout): WorkoutDetail {
  const program = programs.find((item) => item.id === workout.programId);
  if (!program) {
    throw notFound("Program", workout.programId);
  }
  const items = itemsForWorkout(workout.id);
  const workoutExercisesList = items.map((item) =>
    requireExercise(item.exerciseId),
  );
  return {
    workout,
    program,
    items,
    exercises: workoutExercisesList,
    muscleGroups: muscleGroupsFromExercises(workoutExercisesList),
    exerciseCount: items.length,
    estimatedMinutes: estimateWorkoutMinutes(items),
    inProgress: Boolean(inProgressFor(workout.id)),
  };
}

function nextUpcomingWorkout(): Workout | null {
  const program = programs[0];
  if (!program) {
    return null;
  }
  const active = store.sessions.find(
    (session) => session.status === "in_progress" && session.workoutId,
  );
  if (active?.workoutId) {
    return requireWorkout(active.workoutId);
  }
  const completed = store.sessions
    .filter((session) => session.status === "completed" && session.workoutId)
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const lastId = completed[0]?.workoutId;
  const ids = program.workoutIds;
  const lastIndex = lastId ? ids.indexOf(lastId) : -1;
  const nextId = ids[(lastIndex + 1) % ids.length];
  if (!nextId) {
    return null;
  }
  return requireWorkout(nextId);
}

function toSessionDetail(session: WorkoutSession): SessionDetail {
  const blocks = store.sessionExercises
    .filter((item) => item.sessionId === session.id)
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const exercise = requireExercise(item.exerciseId);
      const prescription =
        itemsForWorkout(session.workoutId ?? "").find(
          (row) => row.exerciseId === item.exerciseId && row.order === item.order,
        ) ??
        itemsForWorkout(session.workoutId ?? "").find(
          (row) => row.exerciseId === item.exerciseId,
        );
      if (!prescription) {
        throw notFound("Prescription", item.exerciseId);
      }
      const sets = store.performedSets
        .filter((set) => set.sessionExerciseId === item.id)
        .slice()
        .sort((a, b) => a.setNumber - b.setNumber);
      return { item, exercise, prescription, sets };
    });

  return { session, blocks };
}

export function getWorkoutDetail(workoutId: string): Promise<WorkoutDetail> {
  return Promise.resolve(toWorkoutDetail(requireWorkout(workoutId)));
}

export function getUpcomingWorkoutDetail(): Promise<WorkoutDetail | null> {
  const workout = nextUpcomingWorkout();
  return Promise.resolve(workout ? toWorkoutDetail(workout) : null);
}

export function getSessionDetail(sessionId: string): Promise<SessionDetail> {
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) {
    throw notFound("Workout session", sessionId);
  }
  return Promise.resolve(toSessionDetail(session));
}

export function getInProgressForWorkout(
  workoutId: string,
): Promise<WorkoutSession | null> {
  requireWorkout(workoutId);
  return Promise.resolve(inProgressFor(workoutId) ?? null);
}

export function startWorkout(workoutId: string): Promise<WorkoutSession> {
  const workout = requireWorkout(workoutId);
  const existing = inProgressFor(workoutId);
  if (existing) {
    return Promise.resolve(existing);
  }

  const sessionId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const session: WorkoutSession = {
    id: sessionId,
    userId: programs[0]?.userId ?? "user-alex",
    workoutId: workout.id,
    name: workout.name,
    status: "in_progress",
    startedAt,
    completedAt: null,
    durationMinutes: null,
    notes: null,
  };
  store.sessions.push(session);

  for (const item of itemsForWorkout(workout.id)) {
    const sessionExerciseId = crypto.randomUUID();
    store.sessionExercises.push({
      id: sessionExerciseId,
      sessionId,
      exerciseId: item.exerciseId,
      order: item.order,
    });
    for (let setNumber = 1; setNumber <= item.targetSets; setNumber += 1) {
      store.performedSets.push({
        id: crypto.randomUUID(),
        sessionExerciseId,
        setNumber,
        weightKg: item.targetWeightKg,
        reps: null,
        rpe: null,
        completed: false,
        completedAt: null,
      });
    }
  }

  persist();
  return Promise.resolve(session);
}

export function updateSet(
  sessionId: string,
  setId: string,
  input: UpdateSetInput,
): Promise<SessionDetail> {
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) {
    throw notFound("Workout session", sessionId);
  }
  if (session.status !== "in_progress") {
    throw new ApiError(
      "Workout session is not in progress",
      "conflict",
      409,
    );
  }

  const sessionExerciseIds = new Set(
    store.sessionExercises
      .filter((item) => item.sessionId === sessionId)
      .map((item) => item.id),
  );
  const set = store.performedSets.find((item) => item.id === setId);
  if (!set || !sessionExerciseIds.has(set.sessionExerciseId)) {
    throw notFound("Set", setId);
  }

  if (input.weightKg !== undefined) {
    if (input.weightKg < 0) {
      throw new ApiError("weightKg must not be negative", "bad_request", 400);
    }
    set.weightKg = input.weightKg;
  }
  if (input.reps !== undefined) {
    if (!Number.isInteger(input.reps) || input.reps < 1) {
      throw new ApiError("reps must be a positive integer", "bad_request", 400);
    }
    set.reps = input.reps;
  }
  if (input.rpe !== undefined) {
    set.rpe = input.rpe as Rpe | null;
  }

  const nextWeight = set.weightKg;
  const nextReps = set.reps;
  if (input.completed === true) {
    if (nextWeight === null || nextReps === null) {
      throw new ApiError(
        "Weight and reps are required to complete a set",
        "bad_request",
        400,
      );
    }
    set.completed = true;
    set.completedAt = set.completedAt ?? new Date().toISOString();
  }
  if (input.completed === false) {
    set.completed = false;
    set.completedAt = null;
  }

  persist();
  return Promise.resolve(toSessionDetail(session));
}

export function completeSession(sessionId: string): Promise<SessionDetail> {
  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) {
    throw notFound("Workout session", sessionId);
  }
  if (session.status === "completed") {
    return Promise.resolve(toSessionDetail(session));
  }
  if (session.status !== "in_progress") {
    throw new ApiError(
      "Workout session is not in progress",
      "conflict",
      409,
    );
  }

  const sessionExerciseIds = store.sessionExercises
    .filter((item) => item.sessionId === sessionId)
    .map((item) => item.id);
  const sets = store.performedSets.filter((set) =>
    sessionExerciseIds.includes(set.sessionExerciseId),
  );
  if (sets.length === 0 || sets.some((set) => !set.completed)) {
    throw new ApiError(
      "Complete all sets before finishing this workout",
      "bad_request",
      400,
    );
  }

  session.status = "completed";
  session.completedAt = new Date().toISOString();
  const elapsed =
    Date.parse(session.completedAt) - Date.parse(session.startedAt);
  session.durationMinutes = Number.isFinite(elapsed)
    ? Math.max(1, Math.round(elapsed / 60_000))
    : 1;
  persist();
  return Promise.resolve(toSessionDetail(session));
}
