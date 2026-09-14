import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { seedIds } from '../prisma/seed-ids.js';
import { seedDatabase } from '../prisma/seed.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { CurrentUserService } from '../src/current-user/current-user.service.js';
import { PrismaService } from '../src/database/prisma.service.js';

const OTHER_USER_ID = '11111111-1111-4111-8111-111111111199';
const OTHER_WORKOUT_ID = '33333333-3333-4333-8333-333333333399';

describe('Squat API e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let actingUserId = seedIds.user;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CurrentUserService)
      .useValue({
        getCurrentUser: async () => {
          const user = await prisma.user.findUniqueOrThrow({
            where: { id: actingUserId },
            select: { id: true, email: true, displayName: true },
          });
          return user;
        },
      })
      .compile();

    prisma = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    await seedDatabase(prisma);
    await ensureOtherUser();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    actingUserId = seedIds.user;
  });

  it('GET /health returns ok when the database is up', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /api/v1/workouts/upcoming returns the next planned workout', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/workouts/upcoming',
    );
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(seedIds.workoutPush);
    expect(response.body.data.name).toBe('Push A');
    expect(response.body.data.exercises).toHaveLength(5);
    expect(response.body.data.exercises[0].targetSets).toBe(4);
  });

  it('does not return another users workout', async () => {
    actingUserId = OTHER_USER_ID;
    const response = await request(app.getHttpServer()).get(
      `/api/v1/workouts/${seedIds.workoutPush}`,
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Workout not found');
  });

  it('starts a workout atomically and resumes the same in-progress session', async () => {
    await prisma.set.deleteMany({
      where: { sessionExercise: { session: { status: 'IN_PROGRESS' } } },
    });
    await prisma.sessionExercise.deleteMany({
      where: { session: { status: 'IN_PROGRESS' } },
    });
    await prisma.workoutSession.deleteMany({
      where: { status: 'IN_PROGRESS' },
    });

    const first = await request(app.getHttpServer()).post(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
    );
    expect(first.status).toBe(200);
    expect(first.body.data.status).toBe('in_progress');
    expect(first.body.data.exercises).toHaveLength(5);
    const setCount = first.body.data.exercises.reduce(
      (sum: number, item: { sets: unknown[] }) => sum + item.sets.length,
      0,
    );
    expect(setCount).toBe(16);

    const second = await request(app.getHttpServer()).post(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
    );
    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);

    const activeCount = await prisma.workoutSession.count({
      where: {
        userId: seedIds.user,
        workoutId: seedIds.workoutPush,
        status: 'IN_PROGRESS',
      },
    });
    expect(activeCount).toBe(1);

    const fetched = await request(app.getHttpServer()).get(
      `/api/v1/workout-sessions/${first.body.data.id}`,
    );
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.exercises[0].prescription.targetSets).toBe(4);
  });

  it('does not return another users session', async () => {
    const session = await prisma.workoutSession.findFirstOrThrow({
      where: { userId: seedIds.user, status: 'COMPLETED' },
    });
    actingUserId = OTHER_USER_ID;
    const response = await request(app.getHttpServer()).get(
      `/api/v1/workout-sessions/${session.id}`,
    );
    expect(response.status).toBe(404);
  });

  it('returns 404 when no in-progress session exists after cleanup', async () => {
    await prisma.set.deleteMany({
      where: { sessionExercise: { session: { status: 'IN_PROGRESS' } } },
    });
    await prisma.sessionExercise.deleteMany({
      where: { session: { status: 'IN_PROGRESS' } },
    });
    await prisma.workoutSession.deleteMany({
      where: { status: 'IN_PROGRESS' },
    });

    const response = await request(app.getHttpServer()).get(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions/in-progress`,
    );
    expect(response.status).toBe(404);
  });

  it('does not create two in-progress sessions under concurrent starts', async () => {
    await prisma.set.deleteMany({
      where: { sessionExercise: { session: { status: 'IN_PROGRESS' } } },
    });
    await prisma.sessionExercise.deleteMany({
      where: { session: { status: 'IN_PROGRESS' } },
    });
    await prisma.workoutSession.deleteMany({
      where: { status: 'IN_PROGRESS' },
    });

    const [first, second] = await Promise.all([
      request(app.getHttpServer()).post(
        `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
      ),
      request(app.getHttpServer()).post(
        `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
      ),
    ]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.data.id).toBe(second.body.data.id);

    const activeCount = await prisma.workoutSession.count({
      where: {
        userId: seedIds.user,
        workoutId: seedIds.workoutPush,
        status: 'IN_PROGRESS',
      },
    });
    expect(activeCount).toBe(1);
  });

  it('updates and completes a set for the current user', async () => {
    await prisma.set.deleteMany({
      where: { sessionExercise: { session: { status: 'IN_PROGRESS' } } },
    });
    await prisma.sessionExercise.deleteMany({
      where: { session: { status: 'IN_PROGRESS' } },
    });
    await prisma.workoutSession.deleteMany({
      where: { status: 'IN_PROGRESS' },
    });

    const started = await request(app.getHttpServer()).post(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
    );
    const setId = started.body.data.exercises[0].sets[0].id as string;
    const sessionId = started.body.data.id as string;

    const invalidWeight = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${sessionId}/sets/${setId}`)
      .send({ weightKg: -1, reps: 5, completed: true });
    expect(invalidWeight.status).toBe(400);

    const invalidReps = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${sessionId}/sets/${setId}`)
      .send({ weightKg: 80, reps: 0, completed: true });
    expect(invalidReps.status).toBe(400);

    const invalidRpe = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${sessionId}/sets/${setId}`)
      .send({ weightKg: 80, reps: 5, rpe: 11, completed: true });
    expect(invalidRpe.status).toBe(400);

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${sessionId}/sets/${setId}`)
      .send({ weightKg: 80, reps: 5, rpe: 8, completed: true });
    expect(updated.status).toBe(200);
    expect(updated.body.data.exercises[0].sets[0].completed).toBe(true);
    expect(updated.body.data.exercises[0].sets[0].completedAt).toBeTruthy();

    const persisted = await prisma.set.findUniqueOrThrow({
      where: { id: setId },
    });
    expect(persisted.completedAt).not.toBeNull();
    expect(Number(persisted.weightKg)).toBe(80);
  });

  it('rejects set updates from another session or user', async () => {
    const own = await prisma.workoutSession.findFirstOrThrow({
      where: { userId: seedIds.user, status: 'COMPLETED' },
      include: { exercises: { include: { sets: true } } },
    });
    const setId = own.exercises[0]?.sets[0]?.id;
    expect(setId).toBeDefined();

    const live = await prisma.workoutSession.findFirstOrThrow({
      where: { userId: seedIds.user, status: 'IN_PROGRESS' },
      include: { exercises: { include: { sets: true } } },
    });
    const liveSetId = live.exercises[0]?.sets[0]?.id;
    expect(liveSetId).toBeDefined();

    const mismatch = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${live.id}/sets/${setId}`)
      .send({ reps: 5 });
    expect(mismatch.status).toBe(404);

    actingUserId = OTHER_USER_ID;
    const foreign = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${live.id}/sets/${liveSetId}`)
      .send({ reps: 5 });
    expect(foreign.status).toBe(404);
  });

  it('completes a session only after every set is logged', async () => {
    await prisma.set.deleteMany({
      where: { sessionExercise: { session: { status: 'IN_PROGRESS' } } },
    });
    await prisma.sessionExercise.deleteMany({
      where: { session: { status: 'IN_PROGRESS' } },
    });
    await prisma.workoutSession.deleteMany({
      where: { status: 'IN_PROGRESS' },
    });

    const started = await request(app.getHttpServer()).post(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
    );
    const sessionId = started.body.data.id as string;

    const tooSoon = await request(app.getHttpServer()).post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(tooSoon.status).toBe(400);

    const setIds = (
      started.body.data.exercises as { sets: { id: string }[] }[]
    ).flatMap((exercise) => exercise.sets.map((set) => set.id));

    for (const setId of setIds) {
      const patched = await request(app.getHttpServer())
        .patch(`/api/v1/workout-sessions/${sessionId}/sets/${setId}`)
        .send({ weightKg: 50, reps: 5, completed: true });
      expect(patched.status).toBe(200);
    }

    const completed = await request(app.getHttpServer()).post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(completed.status).toBe(200);
    expect(completed.body.data.status).toBe('completed');
    expect(completed.body.data.completedAt).toBeTruthy();

    const reloaded = await request(app.getHttpServer()).get(
      `/api/v1/workout-sessions/${sessionId}`,
    );
    expect(reloaded.body.data.exercises[0].sets[0].completed).toBe(true);

    const again = await request(app.getHttpServer()).post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(again.status).toBe(200);
    expect(again.body.data.id).toBe(sessionId);

    const setId = setIds[0];
    const after = await request(app.getHttpServer())
      .patch(`/api/v1/workout-sessions/${sessionId}/sets/${setId}`)
      .send({ reps: 6 });
    expect(after.status).toBe(409);

    actingUserId = OTHER_USER_ID;
    const foreign = await request(app.getHttpServer()).post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(foreign.status).toBe(404);
  });

  async function ensureOtherUser(): Promise<void> {
    const passwordHash = await hash('other-dev-password', 10);
    await prisma.user.upsert({
      where: { id: OTHER_USER_ID },
      update: {},
      create: {
        id: OTHER_USER_ID,
        email: 'other@squat.app',
        displayName: 'Other Lifter',
        passwordHash,
        programs: {
          create: {
            name: 'Other Program',
            description: 'Ownership fixture',
            workouts: {
              create: {
                id: OTHER_WORKOUT_ID,
                name: 'Other Workout',
                order: 1,
              },
            },
          },
        },
      },
    });
  }
});
