import { useState } from "react";
import { BottomSheet, Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { formatMuscleGroupList } from "@/lib/workoutMeta";
import { api } from "@/services/api";
import type { WorkoutDetail } from "@/services/api/map";
import type { WorkoutSummary } from "@/types/domain";
import styles from "./upcoming-switcher.module.css";

export function UpcomingSwitcher({
  currentId,
  onChanged,
}: {
  currentId: string;
  onChanged: (next: WorkoutDetail) => void;
}) {
  const { pushToast } = useToast();
  const [pending, setPending] = useState<"skip" | "choose" | null>(null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly WorkoutSummary[] | null>(
    null,
  );

  const busy = pending !== null;

  const skip = async () => {
    if (busy) {
      return;
    }
    setPending("skip");
    try {
      const next = await api.workouts.skipUpcoming();
      pushToast(`Skipped. Next up: ${next.workout.name}.`);
      onChanged(next);
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Couldn't skip this day.",
        "error",
      );
    } finally {
      setPending(null);
    }
  };

  const openChooser = async () => {
    if (busy) {
      return;
    }
    setPending("choose");
    try {
      const workouts = await api.workouts.listWorkouts();
      setOptions(workouts);
      setOpen(true);
    } catch {
      pushToast("Couldn't load the other days.", "error");
    } finally {
      setPending(null);
    }
  };

  const choose = async (workoutId: string) => {
    if (busy) {
      return;
    }
    if (workoutId === currentId) {
      setOpen(false);
      return;
    }
    setPending("choose");
    try {
      const next = await api.workouts.chooseUpcoming(workoutId);
      setOpen(false);
      pushToast(`Switched to ${next.workout.name} for today.`);
      onChanged(next);
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Couldn't change this day.",
        "error",
      );
    } finally {
      setPending(null);
    }
  };

  const choices = options ?? [];

  return (
    <>
      <div className={styles.row}>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            void skip();
          }}
        >
          {pending === "skip" ? "Skipping…" : "Skip"}
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            void openChooser();
          }}
        >
          Change
        </Button>
      </div>

      <BottomSheet
        title="Train a different day"
        open={open}
        onClose={() => setOpen(false)}
      >
        <p className={`t-secondary ${styles.hint}`}>
          Occupied machines? Pick another day. The queued workout stays next
          unless you skip it.
        </p>
        <div className={styles.choices}>
          {choices.map((workout) => {
            const selected = workout.id === currentId;
            return (
              <button
                key={workout.id}
                type="button"
                className={selected ? styles.choiceSelected : styles.choice}
                disabled={busy}
                onClick={() => {
                  void choose(workout.id);
                }}
              >
                <span className="t-exercise">{workout.name}</span>
                <span className="t-secondary">
                  {formatMuscleGroupList(workout.muscleGroups)}
                  {" · "}
                  {workout.exerciseCount}{" "}
                  {workout.exerciseCount === 1 ? "exercise" : "exercises"}
                </span>
                {selected ? <span className="t-meta">Today</span> : null}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
