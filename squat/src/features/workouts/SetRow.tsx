import { NumberInput } from "@/components/ui";
import { formatRepTarget } from "@/lib/format";
import { cx } from "@/lib/cx";
import {
  RPE_OPTIONS,
  type SetDraft,
} from "@/features/workouts/setDraft";
import type { PerformedSet, WorkoutExercise } from "@/types/domain";
import styles from "./active.module.css";

export type { SetDraft };

interface SetRowProps {
  set: PerformedSet;
  prescription: WorkoutExercise;
  current: boolean;
  draft: SetDraft;
  disabled: boolean;
  onChange: (draft: SetDraft) => void;
}

export function SetRow({
  set,
  prescription,
  current,
  draft,
  disabled,
  onChange,
}: SetRowProps) {
  if (!current) {
    return (
      <div
        className={cx(styles.setSummary, set.completed && styles.setComplete)}
      >
        <span className="t-meta">Set {set.setNumber}</span>
        <span className="t-body">
          {set.weightKg == null ? "—" : `${set.weightKg} kg`}
        </span>
        <span className="t-body">
          {set.reps == null ? "—" : `${set.reps} reps`}
        </span>
        <span className="t-secondary">
          {set.completed
            ? set.rpe == null
              ? "Done"
              : `RPE ${set.rpe}`
            : "Up next"}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.currentSet}>
      <p className="t-meta">
        Set {set.setNumber} of {prescription.targetSets}
        {" · "}
        {formatRepTarget(prescription.targetReps)}
      </p>
      <div className={styles.inputs}>
        <NumberInput
          label="Weight"
          suffix="kg"
          value={draft.weightKg}
          min={0}
          max={999}
          step={2.5}
          disabled={disabled}
          onChange={(weightKg) => onChange({ ...draft, weightKg })}
        />
        <NumberInput
          label="Reps"
          value={draft.reps}
          min={1}
          max={99}
          step={1}
          integer
          disabled={disabled}
          onChange={(reps) => onChange({ ...draft, reps })}
        />
      </div>
      <div className={styles.rpe} role="group" aria-label="RPE">
        <p className="t-meta">RPE optional</p>
        <div className={styles.rpeRow}>
          <button
            type="button"
            className={cx(styles.rpeChip, draft.rpe === null && styles.rpeOn)}
            disabled={disabled}
            aria-pressed={draft.rpe === null}
            onClick={() => onChange({ ...draft, rpe: null })}
          >
            Skip
          </button>
          {RPE_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className={cx(styles.rpeChip, draft.rpe === value && styles.rpeOn)}
              disabled={disabled}
              aria-pressed={draft.rpe === value}
              onClick={() => onChange({ ...draft, rpe: value })}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
