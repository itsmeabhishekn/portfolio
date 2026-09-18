-- AlterTable
ALTER TABLE "programs" ADD COLUMN "next_workout_id" UUID;
ALTER TABLE "programs" ADD COLUMN "override_workout_id" UUID;

-- CreateIndex
CREATE INDEX "programs_next_workout_id_idx" ON "programs"("next_workout_id");
CREATE INDEX "programs_override_workout_id_idx" ON "programs"("override_workout_id");

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_next_workout_id_fkey" FOREIGN KEY ("next_workout_id") REFERENCES "workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "programs" ADD CONSTRAINT "programs_override_workout_id_fkey" FOREIGN KEY ("override_workout_id") REFERENCES "workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill the rotation cursor to the first day of each program.
UPDATE "programs" AS program
SET "next_workout_id" = (
  SELECT workout.id
  FROM "workouts" AS workout
  WHERE workout.program_id = program.id
  ORDER BY workout."order" ASC
  LIMIT 1
)
WHERE program."next_workout_id" IS NULL;
