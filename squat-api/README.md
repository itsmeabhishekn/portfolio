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
| `DEV_USER_EMAIL` | Seeded development user |
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

## Migrations and seed

```bash
npx prisma migrate dev
npm run prisma:seed
```

The first migration creates the relational schema. The second adds a partial unique index (Prisma cannot express `UNIQUE (...) WHERE status = 'IN_PROGRESS'`) plus check constraints for rep ranges, set numbers, and RPE.

Seed is deterministic and safe to rerun. It recreates Alex Rivera, PPL Strength Block (Push A / Pull A / Legs A), and three completed sessions matching the frontend mock.

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

The API port is published on `127.0.0.1` only, because `DevAuthGuard` authenticates
nobody (see below). Serve it publicly through a reverse proxy that terminates HTTPS,
and set `CORS_ORIGINS` to the deployed frontend origin.

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

## Development authentication

There are no login endpoints. `DevCurrentUserService` loads `DEV_USER_EMAIL` from the database and `DevAuthGuard` attaches that user to every product request.

Do not send user IDs in request bodies. Swap `CurrentUserService` for a JWT implementation later without rewriting workout/session services.

Seeded user:

- email: `alex@squat.app`
- password hash exists but is unused until the auth phase
- password (dev only): `dev-password-not-for-production`

## Future authentication

Replace `DevCurrentUserService` / `DevAuthGuard` with JWT (or session) auth that still populates `request.user`. Keep `getWorkout(workoutId, currentUserId)` signatures.

## Intentionally not in this phase

JWT, OAuth, history/progress APIs, Redis, queues, HTTPS termination, and load tests.
