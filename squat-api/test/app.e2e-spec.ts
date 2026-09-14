import { UnauthorizedException, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import {
  GoogleIdentityVerifier,
  type GoogleIdentity,
} from '../src/auth/google-identity.service.js';
import { SessionTokenService } from '../src/auth/session-token.service.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { seedIds } from './fixtures/ids.js';
import { seedDatabase } from './fixtures/seed.js';

const OTHER_USER_ID = '11111111-1111-4111-8111-111111111199';
const OTHER_WORKOUT_ID = '33333333-3333-4333-8333-333333333399';

// Only the network call to Google is faked. Everything after it — token issuing,
// the guard, user creation, ownership — runs for real.
const googleAccounts = new Map<string, GoogleIdentity>();

const fakeGoogle: GoogleIdentityVerifier = {
  verify: async (credential: string): Promise<GoogleIdentity> => {
    const identity = googleAccounts.get(credential);
    if (!identity) {
      throw new UnauthorizedException('Google sign-in could not be verified.');
    }
    return identity;
  },
};

describe('Squat API e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokens: SessionTokenService;
  let ownerToken: string;
  let otherToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleIdentityVerifier)
      .useValue(fakeGoogle)
      .compile();

    prisma = moduleRef.get(PrismaService);
    tokens = moduleRef.get(SessionTokenService);
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    await seedDatabase(prisma);
    await ensureOtherUser();

    ownerToken = await tokens.issue(seedIds.user);
    otherToken = await tokens.issue(OTHER_USER_ID);
  });

  afterAll(async () => {
    await app.close();
  });

  function get(path: string, token: string = ownerToken) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function post(path: string, token: string = ownerToken) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`);
  }

  function patch(path: string, token: string = ownerToken) {
    return request(app.getHttpServer())
      .patch(path)
      .set('Authorization', `Bearer ${token}`);
  }

  it('GET /health returns ok when the database is up', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('rejects protected routes without a bearer token', async () => {
    const upcoming = await request(app.getHttpServer()).get(
      '/api/v1/workouts/upcoming',
    );
    expect(upcoming.status).toBe(401);

    const me = await request(app.getHttpServer()).get('/api/v1/auth/me');
    expect(me.status).toBe(401);
  });

  it('rejects a malformed or tampered session token', async () => {
    const wrongScheme = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', ownerToken);
    expect(wrongScheme.status).toBe(401);

    const tampered = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${ownerToken.slice(0, -3)}abc`);
    expect(tampered.status).toBe(401);

    const forged = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(forged.status).toBe(401);
  });

  it('rejects a session token for a user that no longer exists', async () => {
    const orphan = await tokens.issue('11111111-1111-4111-8111-1111111111ff');
    const response = await get('/api/v1/auth/me', orphan);
    expect(response.status).toBe(401);
  });

  it('rejects an invalid Google credential', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: 'tampered-google-token' });
    expect(response.status).toBe(401);

    const empty = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: '' });
    expect(empty.status).toBe(400);
  });

  it('creates a user with a starter program on first Google sign-in', async () => {
    googleAccounts.set('credential-newcomer', {
      sub: 'google-sub-newcomer',
      email: 'newcomer@example.test',
      displayName: 'New Comer',
    });

    const signIn = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: 'credential-newcomer' });

    expect(signIn.status).toBe(200);
    expect(typeof signIn.body.data.token).toBe('string');
    expect(signIn.body.data.user.email).toBe('newcomer@example.test');

    const token = signIn.body.data.token as string;

    const me = await get('/api/v1/auth/me', token);
    expect(me.status).toBe(200);
    expect(me.body.data.displayName).toBe('New Comer');

    // A real user with no data would be useless, so sign-in provisions a program.
    const upcoming = await get('/api/v1/workouts/upcoming', token);
    expect(upcoming.status).toBe(200);
    expect(upcoming.body.data.name).toBe('Push A');
    expect(upcoming.body.data.exercises).toHaveLength(5);
    expect(upcoming.body.data.program.name).toBe('Push Pull Legs');
  });

  it('reuses the same user on repeat sign-in and refreshes the profile', async () => {
    googleAccounts.set('credential-repeat', {
      sub: 'google-sub-repeat',
      email: 'repeat@example.test',
      displayName: 'First Name',
    });

    const first = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: 'credential-repeat' });
    expect(first.status).toBe(200);

    googleAccounts.set('credential-repeat', {
      sub: 'google-sub-repeat',
      email: 'renamed@example.test',
      displayName: 'Renamed Lifter',
    });

    const second = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: 'credential-repeat' });
    expect(second.status).toBe(200);
    expect(second.body.data.user.id).toBe(first.body.data.user.id);
    expect(second.body.data.user.email).toBe('renamed@example.test');
    expect(second.body.data.user.displayName).toBe('Renamed Lifter');

    const count = await prisma.user.count({
      where: { googleSub: 'google-sub-repeat' },
    });
    expect(count).toBe(1);

    const programs = await prisma.program.count({
      where: { userId: first.body.data.user.id as string },
    });
    expect(programs).toBe(1);
  });

  it('keeps each Google identity on its own data', async () => {
    googleAccounts.set('credential-a', {
      sub: 'google-sub-a',
      email: 'lifter-a@example.test',
      displayName: 'Lifter A',
    });
    googleAccounts.set('credential-b', {
      sub: 'google-sub-b',
      email: 'lifter-b@example.test',
      displayName: 'Lifter B',
    });

    const a = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: 'credential-a' });
    const b = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ credential: 'credential-b' });

    const tokenA = a.body.data.token as string;
    const tokenB = b.body.data.token as string;

    const workoutA = await get('/api/v1/workouts/upcoming', tokenA);
    const workoutB = await get('/api/v1/workouts/upcoming', tokenB);
    expect(workoutA.body.data.id).not.toBe(workoutB.body.data.id);

    const started = await post(
      `/api/v1/workouts/${workoutA.body.data.id}/sessions`,
      tokenA,
    );
    expect(started.status).toBe(200);
    const sessionId = started.body.data.id as string;

    const asOwner = await get(`/api/v1/workout-sessions/${sessionId}`, tokenA);
    expect(asOwner.status).toBe(200);

    const asStranger = await get(
      `/api/v1/workout-sessions/${sessionId}`,
      tokenB,
    );
    expect(asStranger.status).toBe(404);

    const templateAsStranger = await get(
      `/api/v1/workouts/${workoutA.body.data.id}`,
      tokenB,
    );
    expect(templateAsStranger.status).toBe(404);
  });

  it('GET /api/v1/workouts/upcoming returns the next planned workout', async () => {
    const response = await get('/api/v1/workouts/upcoming');
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(seedIds.workoutPush);
    expect(response.body.data.name).toBe('Push A');
    expect(response.body.data.exercises).toHaveLength(5);
    expect(response.body.data.exercises[0].targetSets).toBe(4);
  });

  it('does not return another users workout', async () => {
    const response = await get(
      `/api/v1/workouts/${seedIds.workoutPush}`,
      otherToken,
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Workout not found');
  });

  it('starts a workout atomically and resumes the same in-progress session', async () => {
    await clearOwnerSessions();

    const first = await post(
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

    const second = await post(
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

    const fetched = await get(
      `/api/v1/workout-sessions/${first.body.data.id}`,
    );
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.exercises[0].prescription.targetSets).toBe(4);
  });

  it('does not return another users session', async () => {
    const session = await prisma.workoutSession.findFirstOrThrow({
      where: { userId: seedIds.user, status: 'COMPLETED' },
    });
    const response = await get(
      `/api/v1/workout-sessions/${session.id}`,
      otherToken,
    );
    expect(response.status).toBe(404);
  });

  it('returns 404 when no in-progress session exists after cleanup', async () => {
    await clearOwnerSessions();

    const response = await get(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions/in-progress`,
    );
    expect(response.status).toBe(404);
  });

  it('does not create two in-progress sessions under concurrent starts', async () => {
    await clearOwnerSessions();

    const [first, second] = await Promise.all([
      post(`/api/v1/workouts/${seedIds.workoutPush}/sessions`),
      post(`/api/v1/workouts/${seedIds.workoutPush}/sessions`),
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
    await clearOwnerSessions();

    const started = await post(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
    );
    const setId = started.body.data.exercises[0].sets[0].id as string;
    const sessionId = started.body.data.id as string;

    const invalidWeight = await patch(
      `/api/v1/workout-sessions/${sessionId}/sets/${setId}`,
    ).send({ weightKg: -1, reps: 5, completed: true });
    expect(invalidWeight.status).toBe(400);

    const invalidReps = await patch(
      `/api/v1/workout-sessions/${sessionId}/sets/${setId}`,
    ).send({ weightKg: 80, reps: 0, completed: true });
    expect(invalidReps.status).toBe(400);

    const invalidRpe = await patch(
      `/api/v1/workout-sessions/${sessionId}/sets/${setId}`,
    ).send({ weightKg: 80, reps: 5, rpe: 11, completed: true });
    expect(invalidRpe.status).toBe(400);

    const updated = await patch(
      `/api/v1/workout-sessions/${sessionId}/sets/${setId}`,
    ).send({ weightKg: 80, reps: 5, rpe: 8, completed: true });
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

    const mismatch = await patch(
      `/api/v1/workout-sessions/${live.id}/sets/${setId}`,
    ).send({ reps: 5 });
    expect(mismatch.status).toBe(404);

    const foreign = await patch(
      `/api/v1/workout-sessions/${live.id}/sets/${liveSetId}`,
      otherToken,
    ).send({ reps: 5 });
    expect(foreign.status).toBe(404);
  });

  it('completes a session only after every set is logged', async () => {
    await clearOwnerSessions();

    const started = await post(
      `/api/v1/workouts/${seedIds.workoutPush}/sessions`,
    );
    const sessionId = started.body.data.id as string;

    const tooSoon = await post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(tooSoon.status).toBe(400);

    const setIds = (
      started.body.data.exercises as { sets: { id: string }[] }[]
    ).flatMap((exercise) => exercise.sets.map((set) => set.id));

    for (const setId of setIds) {
      const patched = await patch(
        `/api/v1/workout-sessions/${sessionId}/sets/${setId}`,
      ).send({ weightKg: 50, reps: 5, completed: true });
      expect(patched.status).toBe(200);
    }

    const completed = await post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(completed.status).toBe(200);
    expect(completed.body.data.status).toBe('completed');
    expect(completed.body.data.completedAt).toBeTruthy();

    const reloaded = await get(`/api/v1/workout-sessions/${sessionId}`);
    expect(reloaded.body.data.exercises[0].sets[0].completed).toBe(true);

    const again = await post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
    );
    expect(again.status).toBe(200);
    expect(again.body.data.id).toBe(sessionId);

    const setId = setIds[0];
    const after = await patch(
      `/api/v1/workout-sessions/${sessionId}/sets/${setId}`,
    ).send({ reps: 6 });
    expect(after.status).toBe(409);

    const foreign = await post(
      `/api/v1/workout-sessions/${sessionId}/complete`,
      otherToken,
    );
    expect(foreign.status).toBe(404);
  });

  async function clearOwnerSessions(): Promise<void> {
    await prisma.set.deleteMany({
      where: {
        sessionExercise: {
          session: { userId: seedIds.user, status: 'IN_PROGRESS' },
        },
      },
    });
    await prisma.sessionExercise.deleteMany({
      where: { session: { userId: seedIds.user, status: 'IN_PROGRESS' } },
    });
    await prisma.workoutSession.deleteMany({
      where: { userId: seedIds.user, status: 'IN_PROGRESS' },
    });
  }

  async function ensureOtherUser(): Promise<void> {
    await prisma.user.upsert({
      where: { id: OTHER_USER_ID },
      update: {},
      create: {
        id: OTHER_USER_ID,
        googleSub: 'google-sub-fixture-other',
        email: 'other@squat.test',
        displayName: 'Other Lifter',
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
