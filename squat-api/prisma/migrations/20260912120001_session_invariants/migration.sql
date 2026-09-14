-- Prisma cannot express a partial unique index. This enforces:
-- one IN_PROGRESS workout session per (user, workout).
CREATE UNIQUE INDEX workout_sessions_one_in_progress_per_user_workout
ON workout_sessions (user_id, workout_id)
WHERE status = 'IN_PROGRESS';

ALTER TABLE workout_exercises
  ADD CONSTRAINT workout_exercises_rep_range_check
  CHECK (rep_min <= rep_max);

ALTER TABLE workout_exercises
  ADD CONSTRAINT workout_exercises_target_sets_positive_check
  CHECK (target_sets > 0);

ALTER TABLE workout_exercises
  ADD CONSTRAINT workout_exercises_rest_seconds_non_negative_check
  CHECK (rest_seconds >= 0);

ALTER TABLE sets
  ADD CONSTRAINT sets_set_number_positive_check
  CHECK (set_number > 0);

ALTER TABLE sets
  ADD CONSTRAINT sets_reps_non_negative_check
  CHECK (reps IS NULL OR reps >= 0);

ALTER TABLE sets
  ADD CONSTRAINT sets_rpe_range_check
  CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));
