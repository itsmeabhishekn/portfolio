-- Google Sign-In replaces the development-user mechanism.
--
-- Any existing row is a development-auth artifact: it has a password hash and no
-- Google identity, so it can never authenticate under the new model. Deleting
-- first is what makes the NOT NULL column below addable. Programs and sessions
-- cascade. Exercises are global reference data and are untouched.
-- DELETE FROM "users";

ALTER TABLE "users" DROP COLUMN "password_hash";

ALTER TABLE "users" ADD COLUMN "google_sub" TEXT NOT NULL;

CREATE UNIQUE INDEX "users_google_sub_key" ON "users"("google_sub");
