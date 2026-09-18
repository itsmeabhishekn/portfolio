-- AlterEnum
ALTER TYPE "MuscleGroup" ADD VALUE 'ADDUCTORS';
ALTER TYPE "MuscleGroup" ADD VALUE 'CALVES';

-- AlterTable
ALTER TABLE "exercises"
  ADD COLUMN "catalog_key" TEXT,
  ADD COLUMN "region" TEXT,
  ADD COLUMN "focus" TEXT,
  ADD COLUMN "target_subdivision" TEXT,
  ADD COLUMN "movement_pattern" TEXT,
  ADD COLUMN "mechanics" TEXT,
  ADD COLUMN "acl_friendly" BOOLEAN,
  ADD COLUMN "shoulder_impingement_risk" TEXT;

CREATE UNIQUE INDEX "exercises_catalog_key_key" ON "exercises"("catalog_key");

ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_shoulder_impingement_risk_check"
  CHECK (
    "shoulder_impingement_risk" IS NULL
    OR "shoulder_impingement_risk" IN ('Low', 'Moderate', 'High')
  );

ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_mechanics_check"
  CHECK (
    "mechanics" IS NULL
    OR "mechanics" IN ('Compound', 'Isolation')
  );
