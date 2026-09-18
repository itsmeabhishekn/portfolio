# Squat API

NestJS + PostgreSQL backend for Squat. Independent from the Vite frontend in `squat/`.

This phase delivers the first vertical slice:

`upcoming workout → workout template → start/resume session → fetch session`

## Architecture

Modular NestJS monolith:

- `current-user/` — temporary development-user abstraction (replace later with real auth)
- `workouts/` — planned programs/workouts
- `workout-sessions/` — performed sessions
- `database/` — Prisma access
- `health/` — liveness + database check

Controllers handle HTTP. Services own business rules and ownership checks. Prisma is not used from controllers.

## Prerequisites

- Node.js 22+
- Docker

## Environment

Copy `.env.example` to `.env`. Required variables:

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | HTTP port (default `3001`) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `NODE_ENV` | `development` / `test` / `production` |
| `GOOGLE_CLIENT_ID` | OAuth client ID, checked as the Google ID token audience |
| `SESSION_JWT_SECRET` | Signs Squat's own session tokens (32+ characters) |
| `POSTGRES_USER` | Docker Postgres user (local default `squat`) |
| `POSTGRES_PASSWORD` | Docker Postgres password |
| `POSTGRES_DB` | Docker Postgres database name |
| `POSTGRES_PORT` | Host port mapped to Postgres (default `5433`) |

The process fails at boot if any required variable is missing.

## Local PostgreSQL

```bash
docker compose up -d
```

Postgres is published on `localhost:5433` to avoid clashing with a local server on `5432`. A `squat_test` database is also created for tests.

## Migrations

```bash
npx prisma migrate dev
```

The first migration creates the relational schema. The second adds a partial unique index (Prisma cannot express `UNIQUE (...) WHERE status = 'IN_PROGRESS'`) plus check constraints for rep ranges, set numbers, and RPE. The fourth replaces `password_hash` with a unique `google_sub`.

There is no automatic seed. Users are created by Google sign-in with no workouts attached. `GET /workouts/upcoming` returns 404 until that user has a program. Test fixtures live in `test/fixtures/` and are excluded from the production build.

To attach the personal split after you have signed in once:

```bash
npm run program:import -- --email you@example.com
```

The catalog is `data/programs/hypertrophy-stability.json`. Edit that file and re-run the command. Unused templates are replaced in place. If the program already has sessions, the importer writes a new active version and leaves history on the old one. It never creates a user.

## Run

```bash
npm install
npm run start:dev
```

API: `http://localhost:3001`  
Health: `http://localhost:3001/health`  
Swagger: `http://localhost:3001/api/docs`

## API

Product routes are prefixed with `/api/v1`. Health and Swagger are not.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Process + database check |
| `POST` | `/api/v1/auth/google` | Exchange a Google ID token for a session token |
| `GET` | `/api/v1/auth/me` | The authenticated user |
| `GET` | `/api/v1/workouts/upcoming` | Next planned workout for the current user |
| `GET` | `/api/v1/workouts/:workoutId` | Workout template (prescription only) |
| `GET` | `/api/v1/workouts/:workoutId/sessions/in-progress` | Active session, or 404 |
| `POST` | `/api/v1/workouts/:workoutId/sessions` | Start or resume a session |
| `GET` | `/api/v1/workout-sessions/:sessionId` | Performed session graph |

Successful product responses are wrapped as `{ "data": ... }`. Errors use `{ statusCode, message, error }`.

Workout templates use `notes` (matching the existing frontend domain) rather than a separate `description` field. Program still has `description`.

## Tests

```bash
npm test
npm run test:e2e
```

E2E tests expect Postgres to be running.

## Production deploy

`Dockerfile` builds two targets. `runner` carries production dependencies plus the
generated Prisma client. `migrator` keeps devDependencies so `prisma migrate deploy`
runs the CLI version pinned in `package-lock.json` instead of one that `npx` fetches
from the registry at run time.

Create `.env` on the host with the production `DATABASE_URL`, then:

```bash
docker compose -f docker-compose.prod.yml run --rm migrate
docker compose -f docker-compose.prod.yml up -d --build
```

Migrations are a separate step on purpose. Running them from the app container's
entrypoint would let several replicas migrate concurrently.

Never use `prisma migrate dev` or `prisma db push` against the production database.
To inspect state without applying anything:

```bash
docker compose -f docker-compose.prod.yml run --rm migrate npx --no-install prisma migrate status
```

The API port is published on `127.0.0.1` only. Serve it publicly through a reverse
proxy that terminates HTTPS, and set `CORS_ORIGINS` to the deployed frontend origin
(for this project: `https://abhishekn.dev`). A trailing path such as `/squat/` is not
part of the origin. Restart the container after changing `.env`.
HTTPS is not optional in production: a browser on an `https://` page will refuse to
call an `http://` API, and the session token would otherwise cross the network in
clear text.

`.env` on the host needs `GOOGLE_CLIENT_ID` and `SESSION_JWT_SECRET` alongside
`DATABASE_URL`. Neither belongs in the image or in Git.

## Database design

Templates (planned):

`User → Program → Workout → WorkoutExercise → Exercise`

Performed work:

`User → WorkoutSession → SessionExercise → Set`

`Set` stores performed weight/reps/RPE only. Planned reps live on `WorkoutExercise`.

A partial unique index enforces **one `IN_PROGRESS` session per user per workout** at the database level:

```sql
UNIQUE (user_id, workout_id) WHERE status = 'IN_PROGRESS'
```

Prisma cannot express that constraint, so it is added in SQL. Session creation still checks for an existing row first, and a unique-violation race resumes the winner instead of failing.

## Authentication

Google Sign-In only. There are no passwords, no development user, and no seeded account.

```text
frontend → Google → ID token → POST /api/v1/auth/google
                                   ↓ verified server-side
                            find or create User by google_sub
                                   ↓
                        Squat session token (JWT, 30 days)
                                   ↓
                   Authorization: Bearer <token> on every request
```

Google ID tokens are verified with `google-auth-library`, which checks the signature against Google's published keys plus the audience, issuer, and expiry. `GOOGLE_CLIENT_ID` is the expected audience and must match the value the frontend builds with. The Google client **secret** is not used and must not be configured: Squat verifies ID tokens rather than performing an OAuth code exchange.

Identity is keyed on the Google `sub`, never on email. Email and display name are refreshed from the verified profile on each sign-in. If the incoming email already belongs to a different `google_sub`, the stored profile is left alone, because linking accounts by email would be an account-takeover path.

`JwtAuthGuard` runs globally and reads the user from the database on every request, so deleting an account revokes it immediately rather than at token expiry. `@Public()` opts a route out; only `POST /auth/google` and health use it. Protected routes return 401 when the header is missing, malformed, expired, or points at a user that no longer exists.

Ownership is unchanged: services take `currentUserId` from `request.user` and scope every query by it. Never send a user ID in a request body — `forbidNonWhitelisted` rejects it.

Rotating `SESSION_JWT_SECRET` invalidates every existing session.

## First sign-in

A new Google identity creates a `User` row only. Programs, workouts, and sessions are not created automatically. Import a catalog onto that user with `npm run program:import`.

## Intentionally not in this phase

JWT, OAuth, history/progress APIs, Redis, queues, HTTPS termination, and load tests.
