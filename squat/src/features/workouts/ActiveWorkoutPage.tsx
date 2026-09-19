import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadError } from "@/components/feedback/LoadError";
import { Skeleton } from "@/components/feedback/Spinner";
import { Button } from "@/components/ui";
import { paths } from "@/config/paths";
import { UpcomingSwitcher } from "@/features/dashboard/UpcomingSwitcher";
import { RestTimer } from "@/features/workouts/RestTimer";
import { SetRow } from "@/features/workouts/SetRow";
import {
  canCompleteSet,
  draftFromSet,
  type SetDraft,
} from "@/features/workouts/setDraft";
import { useRestTimer } from "@/features/workouts/useRestTimer";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { useToast } from "@/hooks/useToast";
import { cx } from "@/lib/cx";
import { formatDuration } from "@/lib/format";
import { formatMuscleGroup } from "@/lib/workoutMeta";
import { api } from "@/services/api";
import { ApiError, loadFailureCopy } from "@/services/api/client";
import type { SessionBlock, SessionDetail } from "@/services/api/map";
import type { PerformedSet } from "@/types/domain";
import styles from "./active.module.css";

interface Cursor {
  exerciseIndex: number;
  setIndex: number;
}

function firstIncomplete(blocks: readonly SessionBlock[]): Cursor | null {
  for (let exerciseIndex = 0; exerciseIndex < blocks.length; exerciseIndex += 1) {
    const sets = blocks[exerciseIndex]?.sets ?? [];
    for (let setIndex = 0; setIndex < sets.length; setIndex += 1) {
      if (!sets[setIndex]?.completed) {
        return { exerciseIndex, setIndex };
      }
    }
  }
  return null;
}

function allSets(blocks: readonly SessionBlock[]): PerformedSet[] {
  return blocks.flatMap((block) => [...block.sets]);
}

function elapsedMinutes(detail: SessionDetail): number | null {
  if (!detail.session.completedAt) {
    return null;
  }
  const ms =
    Date.parse(detail.session.completedAt) -
    Date.parse(detail.session.startedAt);
  if (!Number.isFinite(ms) || ms < 0) {
    return null;
  }
  return Math.max(1, Math.round(ms / 60_000));
}

export function ActiveWorkoutPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const timer = useRestTimer();
  const { data, error, loading, reload } = useAsyncValue(() => {
    if (!sessionId) {
      return Promise.reject(new Error("Missing session."));
    }
    return api.sessions.getSessionDetail(sessionId);
  }, sessionId ?? "missing-session");

  const [patched, setPatched] = useState<SessionDetail | null>(null);
  const [draft, setDraft] = useState<SetDraft>({
    weightKg: null,
    reps: null,
    rpe: null,
  });
  const [draftSetId, setDraftSetId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"set" | "workout" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const live =
    patched && sessionId && patched.session.id === sessionId ? patched : data;
  const inProgress = live?.session.status === "in_progress";
  const cursor = useMemo(
    () => (live && inProgress ? firstIncomplete(live.blocks) : null),
    [inProgress, live],
  );
  const currentBlock =
    cursor && live ? live.blocks[cursor.exerciseIndex] : undefined;
  const currentSet =
    cursor && currentBlock ? currentBlock.sets[cursor.setIndex] : undefined;
  const activeDraft =
    currentSet && draftSetId === currentSet.id
      ? draft
      : currentSet
        ? draftFromSet(currentSet)
        : draft;

  const updateDraft = (next: SetDraft) => {
    if (!currentSet) {
      return;
    }
    setDraftSetId(currentSet.id);
    setDraft(next);
  };

  const completeCurrentSet = async () => {
    if (!sessionId || !live || !currentSet || !currentBlock || busy) {
      return;
    }
    if (!canCompleteSet(activeDraft) || !inProgress) {
      return;
    }

    setBusy("set");
    setSaveError(null);
    try {
      const next = await api.sessions.updateSet(sessionId, currentSet.id, {
        weightKg: activeDraft.weightKg ?? undefined,
        reps: activeDraft.reps ?? undefined,
        rpe: activeDraft.rpe,
        completed: true,
      });
      setPatched(next);
      const moreWork = firstIncomplete(next.blocks) !== null;
      if (moreWork && currentBlock.prescription.restSeconds > 0) {
        timer.start(currentBlock.prescription.restSeconds);
      } else {
        timer.skip();
      }
    } catch (caught: unknown) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "We couldn't save that set. Try again.";
      setSaveError(message);
      pushToast(message, "error");
    } finally {
      setBusy(null);
    }
  };

  const completeWorkout = async () => {
    if (!sessionId || !live || busy || !inProgress) {
      return;
    }
    setBusy("workout");
    setSaveError(null);
    try {
      const next = await api.sessions.completeSession(sessionId);
      setPatched(next);
      timer.skip();
    } catch (caught: unknown) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "We couldn't complete that request. Try again.";
      setSaveError(message);
      pushToast(message, "error");
    } finally {
      setBusy(null);
    }
  };

  if ((loading && !live) || !sessionId) {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <Skeleton width="40%" height="1rem" />
        <Skeleton width="55%" height="2rem" />
        <Skeleton height="12rem" />
      </div>
    );
  }

  if ((error && !live) || !live) {
    const copy = loadFailureCopy(error);
    return <LoadError title={copy.title} body={copy.body} onRetry={reload} />;
  }

  const completedSets = allSets(live.blocks).filter((set) => set.completed).length;
  const totalSets = allSets(live.blocks).length;
  const allLogged = cursor === null;
  const finished = live.session.status === "completed";
  const nextBlock = cursor ? live.blocks[cursor.exerciseIndex + 1] : undefined;
  const duration = elapsedMinutes(live);

  if (finished) {
    return (
      <div className={styles.page}>
        <div className={styles.summary}>
          <p className="t-meta">Workout complete</p>
          <h1 className={styles.title}>{live.session.name}</h1>
          <p className="t-body">
            {completedSets} {completedSets === 1 ? "set" : "sets"} completed
          </p>
          {duration ? (
            <p className="t-secondary">{formatDuration(duration)}</p>
          ) : null}
          <Button size="lg" onClick={() => navigate(paths.dashboard)}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const block = currentBlock ?? live.blocks[0];
  const exerciseIndex = cursor?.exerciseIndex ?? Math.max(0, live.blocks.length - 1);

  return (
    <div className={cx(styles.page, timer.visible && styles.pageTimer)}>
      <button
        type="button"
        className={styles.back}
        aria-label="Back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <header className={styles.header}>
        <p className="t-meta">
          {allLogged
            ? "All sets logged"
            : `Exercise ${exerciseIndex + 1} of ${live.blocks.length}`}
        </p>
        <h1 className={styles.title}>{live.session.name}</h1>
        {totalSets > 0 ? (
          <p className="t-secondary">
            {completedSets} of {totalSets} sets logged
          </p>
        ) : null}
      </header>

      {inProgress && live.session.workoutId ? (
        <UpcomingSwitcher
          currentId={live.session.workoutId}
          discardsSession
          onChanged={(next) => {
            navigate(paths.workoutTemplate(next.workout.id), { replace: true });
          }}
        />
      ) : null}

      {block && !allLogged ? (
        <section className={styles.exercise} aria-label={block.exercise.name}>
          <div>
            <h2 className="t-exercise">{block.exercise.name}</h2>
            <p className="t-secondary">
              {formatMuscleGroup(block.exercise.muscleGroup)}
            </p>
          </div>

          <div className={styles.sets}>
            {block.sets.map((set, setIndex) => (
              <SetRow
                key={set.id}
                set={set}
                prescription={block.prescription}
                current={
                  Boolean(inProgress && cursor && setIndex === cursor.setIndex)
                }
                draft={activeDraft}
                disabled={busy !== null || !inProgress}
                onChange={updateDraft}
              />
            ))}
          </div>

          {inProgress && currentSet ? (
            <div className={styles.actions}>
              {saveError ? (
                <p className={`t-secondary ${styles.alert}`} role="alert">
                  {saveError}
                </p>
              ) : null}
              <Button
                size="lg"
                disabled={busy !== null || !canCompleteSet(activeDraft)}
                onClick={() => {
                  void completeCurrentSet();
                }}
              >
                {busy === "set" ? "Saving…" : "Complete set"}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {inProgress && allLogged ? (
        <div className={styles.actions}>
          {saveError ? (
            <p className={`t-secondary ${styles.alert}`} role="alert">
              {saveError}
            </p>
          ) : null}
          <Button
            size="lg"
            disabled={busy !== null}
            onClick={() => {
              void completeWorkout();
            }}
          >
            {busy === "workout" ? "Finishing…" : "Complete workout"}
          </Button>
        </div>
      ) : null}

      {nextBlock && inProgress && !allLogged ? (
        <p className={`t-secondary ${styles.next}`}>
          Next: {nextBlock.exercise.name}
        </p>
      ) : null}

      {inProgress ? (
        <RestTimer
          remainingMs={timer.remainingMs}
          totalMs={timer.totalMs}
          running={timer.running}
          onPause={timer.pause}
          onResume={timer.resume}
          onSkip={timer.skip}
        />
      ) : null}
    </div>
  );
}

export { ActiveWorkoutPage as WorkoutSessionPage };
