-- Completed sessions must have completed_at. Incomplete sessions may not.
ALTER TABLE workout_sessions
  ADD CONSTRAINT workout_sessions_completed_requires_timestamp_check
  CHECK (status <> 'COMPLETED' OR completed_at IS NOT NULL);

ALTER TABLE sets
  ADD CONSTRAINT sets_weight_non_negative_check
  CHECK (weight_kg IS NULL OR weight_kg >= 0);

ALTER TABLE sets
  DROP CONSTRAINT sets_reps_non_negative_check;

ALTER TABLE sets
  ADD CONSTRAINT sets_reps_positive_check
  CHECK (reps IS NULL OR reps > 0);
