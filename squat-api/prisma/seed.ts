import {
  Equipment,
  MuscleGroup,
  PrismaClient,
  WorkoutSessionStatus,
} from '@prisma/client';
import { hash } from 'bcryptjs';
import { basename } from 'node:path';
import { seedIds } from './seed-ids.js';

const ids = {
  user: seedIds.user,
  program: seedIds.program,
  workoutPush: seedIds.workoutPush,
  workoutPull: seedIds.workoutPull,
  workoutLegs: seedIds.workoutLegs,
  exBench: '44444444-4444-4444-8444-444444444401',
  exOhp: '44444444-4444-4444-8444-444444444402',
  exIncline: '44444444-4444-4444-8444-444444444403',
  exLateral: '44444444-4444-4444-8444-444444444404',
  exPushdown: '44444444-4444-4444-8444-444444444405',
  exRow: '44444444-4444-4444-8444-444444444406',
  exPullup: '44444444-4444-4444-8444-444444444407',
  exFacePull: '44444444-4444-4444-8444-444444444408',
  exSquat: '44444444-4444-4444-8444-444444444409',
  exRdl: '44444444-4444-4444-8444-444444444410',
  exLegPress: '44444444-4444-4444-8444-444444444411',
  wePush1: '55555555-5555-4555-8555-555555555501',
  wePush2: '55555555-5555-4555-8555-555555555502',
  wePush3: '55555555-5555-4555-8555-555555555503',
  wePush4: '55555555-5555-4555-8555-555555555504',
  wePush5: '55555555-5555-4555-8555-555555555505',
  wePull1: '55555555-5555-4555-8555-555555555511',
  wePull2: '55555555-5555-4555-8555-555555555512',
  wePull3: '55555555-5555-4555-8555-555555555513',
  weLegs1: '55555555-5555-4555-8555-555555555521',
  weLegs2: '55555555-5555-4555-8555-555555555522',
  weLegs3: '55555555-5555-4555-8555-555555555523',
  sessionPush: '66666666-6666-4666-8666-666666666661',
  sessionPull: '66666666-6666-4666-8666-666666666662',
  sessionLegs: '66666666-6666-4666-8666-666666666663',
} as const;

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.set.deleteMany();
  await prisma.sessionExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.program.deleteMany();
  await prisma.user.deleteMany();
  await prisma.exercise.deleteMany();

  const passwordHash = await hash('dev-password-not-for-production', 10);

  await prisma.user.create({
    data: {
      id: ids.user,
      email: 'alex@squat.app',
      displayName: 'Alex Rivera',
      passwordHash,
    },
  });

  await prisma.exercise.createMany({
    data: [
      {
        id: ids.exBench,
        name: 'Barbell Bench Press',
        primaryMuscleGroup: MuscleGroup.CHEST,
        secondaryMuscleGroups: [MuscleGroup.ARMS],
        equipment: Equipment.BARBELL,
      },
      {
        id: ids.exOhp,
        name: 'Overhead Press',
        primaryMuscleGroup: MuscleGroup.SHOULDERS,
        secondaryMuscleGroups: [MuscleGroup.ARMS],
        equipment: Equipment.BARBELL,
      },
      {
        id: ids.exIncline,
        name: 'Incline Dumbbell Press',
        primaryMuscleGroup: MuscleGroup.CHEST,
        secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
        equipment: Equipment.DUMBBELL,
      },
      {
        id: ids.exLateral,
        name: 'Lateral Raise',
        primaryMuscleGroup: MuscleGroup.SHOULDERS,
        secondaryMuscleGroups: [],
        equipment: Equipment.DUMBBELL,
      },
      {
        id: ids.exPushdown,
        name: 'Tricep Pushdown',
        primaryMuscleGroup: MuscleGroup.ARMS,
        secondaryMuscleGroups: [],
        equipment: Equipment.CABLE,
      },
      {
        id: ids.exRow,
        name: 'Barbell Row',
        primaryMuscleGroup: MuscleGroup.BACK,
        secondaryMuscleGroups: [MuscleGroup.ARMS],
        equipment: Equipment.BARBELL,
      },
      {
        id: ids.exPullup,
        name: 'Pull-Up',
        primaryMuscleGroup: MuscleGroup.BACK,
        secondaryMuscleGroups: [MuscleGroup.ARMS],
        equipment: Equipment.BODYWEIGHT,
      },
      {
        id: ids.exFacePull,
        name: 'Face Pull',
        primaryMuscleGroup: MuscleGroup.SHOULDERS,
        secondaryMuscleGroups: [MuscleGroup.BACK],
        equipment: Equipment.CABLE,
      },
      {
        id: ids.exSquat,
        name: 'Back Squat',
        primaryMuscleGroup: MuscleGroup.QUADS,
        secondaryMuscleGroups: [MuscleGroup.GLUTES],
        equipment: Equipment.BARBELL,
      },
      {
        id: ids.exRdl,
        name: 'Romanian Deadlift',
        primaryMuscleGroup: MuscleGroup.HAMSTRINGS,
        secondaryMuscleGroups: [MuscleGroup.GLUTES],
        equipment: Equipment.BARBELL,
      },
      {
        id: ids.exLegPress,
        name: 'Leg Press',
        primaryMuscleGroup: MuscleGroup.QUADS,
        secondaryMuscleGroups: [MuscleGroup.GLUTES],
        equipment: Equipment.MACHINE,
      },
    ],
  });

  await prisma.program.create({
    data: {
      id: ids.program,
      userId: ids.user,
      name: 'PPL Strength Block',
      description: 'Six-day push / pull / legs with a strength emphasis.',
      isActive: true,
      workouts: {
        create: [
          {
            id: ids.workoutPush,
            name: 'Push A',
            notes: 'Heavy bench, moderate press volume.',
            order: 1,
            workoutExercises: {
              create: [
                {
                  id: ids.wePush1,
                  exerciseId: ids.exBench,
                  order: 1,
                  targetSets: 4,
                  repMin: 4,
                  repMax: 6,
                  targetWeightKg: 100,
                  restSeconds: 180,
                },
                {
                  id: ids.wePush2,
                  exerciseId: ids.exOhp,
                  order: 2,
                  targetSets: 3,
                  repMin: 8,
                  repMax: 8,
                  targetWeightKg: 55,
                  restSeconds: 150,
                },
                {
                  id: ids.wePush3,
                  exerciseId: ids.exIncline,
                  order: 3,
                  targetSets: 3,
                  repMin: 8,
                  repMax: 12,
                  targetWeightKg: 32.5,
                  restSeconds: 120,
                },
                {
                  id: ids.wePush4,
                  exerciseId: ids.exLateral,
                  order: 4,
                  targetSets: 3,
                  repMin: 12,
                  repMax: 15,
                  targetWeightKg: 12,
                  restSeconds: 90,
                },
                {
                  id: ids.wePush5,
                  exerciseId: ids.exPushdown,
                  order: 5,
                  targetSets: 3,
                  repMin: 10,
                  repMax: 12,
                  targetWeightKg: 25,
                  restSeconds: 90,
                },
              ],
            },
          },
          {
            id: ids.workoutPull,
            name: 'Pull A',
            notes: 'Rows and vertical pulling.',
            order: 2,
            workoutExercises: {
              create: [
                {
                  id: ids.wePull1,
                  exerciseId: ids.exRow,
                  order: 1,
                  targetSets: 4,
                  repMin: 6,
                  repMax: 6,
                  targetWeightKg: 80,
                  restSeconds: 150,
                },
                {
                  id: ids.wePull2,
                  exerciseId: ids.exPullup,
                  order: 2,
                  targetSets: 3,
                  repMin: 6,
                  repMax: 10,
                  restSeconds: 120,
                },
                {
                  id: ids.wePull3,
                  exerciseId: ids.exFacePull,
                  order: 3,
                  targetSets: 3,
                  repMin: 12,
                  repMax: 15,
                  targetWeightKg: 20,
                  restSeconds: 90,
                },
              ],
            },
          },
          {
            id: ids.workoutLegs,
            name: 'Legs A',
            notes: 'Squat focus plus posterior chain.',
            order: 3,
            workoutExercises: {
              create: [
                {
                  id: ids.weLegs1,
                  exerciseId: ids.exSquat,
                  order: 1,
                  targetSets: 5,
                  repMin: 5,
                  repMax: 5,
                  targetWeightKg: 140,
                  restSeconds: 180,
                },
                {
                  id: ids.weLegs2,
                  exerciseId: ids.exRdl,
                  order: 2,
                  targetSets: 3,
                  repMin: 8,
                  repMax: 8,
                  targetWeightKg: 100,
                  restSeconds: 150,
                },
                {
                  id: ids.weLegs3,
                  exerciseId: ids.exLegPress,
                  order: 3,
                  targetSets: 3,
                  repMin: 10,
                  repMax: 12,
                  targetWeightKg: 180,
                  restSeconds: 120,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await createCompletedSession(prisma, {
    id: ids.sessionPush,
    workoutId: ids.workoutPush,
    startedAt: '2026-09-09T16:10:00.000Z',
    completedAt: '2026-09-09T17:04:00.000Z',
    exercises: [
      {
        workoutExerciseId: ids.wePush1,
        exerciseId: ids.exBench,
        order: 1,
        sets: [
          { setNumber: 1, weightKg: 100, reps: 6, rpe: 7.5, completedAt: '2026-09-09T16:18:00.000Z' },
          { setNumber: 2, weightKg: 100, reps: 5, rpe: 8, completedAt: '2026-09-09T16:22:00.000Z' },
        ],
      },
      {
        workoutExerciseId: ids.wePush2,
        exerciseId: ids.exOhp,
        order: 2,
        sets: [
          { setNumber: 1, weightKg: 55, reps: 8, rpe: 8, completedAt: '2026-09-09T16:40:00.000Z' },
        ],
      },
    ],
  });

  await createCompletedSession(prisma, {
    id: ids.sessionPull,
    workoutId: ids.workoutPull,
    startedAt: '2026-09-10T16:40:00.000Z',
    completedAt: '2026-09-10T17:28:00.000Z',
    exercises: [
      {
        workoutExerciseId: ids.wePull1,
        exerciseId: ids.exRow,
        order: 1,
        sets: [
          { setNumber: 1, weightKg: 80, reps: 6, rpe: 8, completedAt: '2026-09-10T16:50:00.000Z' },
        ],
      },
      {
        workoutExerciseId: ids.wePull2,
        exerciseId: ids.exPullup,
        order: 2,
        sets: [
          { setNumber: 1, weightKg: null, reps: 8, rpe: 8.5, completedAt: '2026-09-10T17:10:00.000Z' },
        ],
      },
    ],
  });

  await createCompletedSession(prisma, {
    id: ids.sessionLegs,
    workoutId: ids.workoutLegs,
    startedAt: '2026-09-11T17:00:00.000Z',
    completedAt: '2026-09-11T18:12:00.000Z',
    exercises: [
      {
        workoutExerciseId: ids.weLegs1,
        exerciseId: ids.exSquat,
        order: 1,
        sets: [
          { setNumber: 1, weightKg: 140, reps: 5, rpe: 8, completedAt: '2026-09-11T17:20:00.000Z' },
          { setNumber: 2, weightKg: 140, reps: 5, rpe: 8.5, completedAt: '2026-09-11T17:24:00.000Z' },
        ],
      },
      {
        workoutExerciseId: ids.weLegs2,
        exerciseId: ids.exRdl,
        order: 2,
        sets: [
          { setNumber: 1, weightKg: 100, reps: 8, rpe: 7, completedAt: '2026-09-11T17:50:00.000Z' },
        ],
      },
      {
        workoutExerciseId: ids.weLegs3,
        exerciseId: ids.exLegPress,
        order: 3,
        sets: [
          { setNumber: 1, weightKg: 180, reps: 10, rpe: 7.5, completedAt: '2026-09-11T18:05:00.000Z' },
        ],
      },
    ],
  });
}

async function createCompletedSession(
  prisma: PrismaClient,
  input: {
    id: string;
    workoutId: string;
    startedAt: string;
    completedAt: string;
    exercises: {
      workoutExerciseId: string;
      exerciseId: string;
      order: number;
      sets: {
        setNumber: number;
        weightKg: number | null;
        reps: number;
        rpe: number;
        completedAt: string;
      }[];
    }[];
  },
): Promise<void> {
  await prisma.workoutSession.create({
    data: {
      id: input.id,
      userId: ids.user,
      workoutId: input.workoutId,
      status: WorkoutSessionStatus.COMPLETED,
      startedAt: new Date(input.startedAt),
      completedAt: new Date(input.completedAt),
      exercises: {
        create: input.exercises.map((exercise) => ({
          workoutExerciseId: exercise.workoutExerciseId,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: {
            create: exercise.sets.map((set) => ({
              setNumber: set.setNumber,
              weightKg: set.weightKg,
              reps: set.reps,
              rpe: set.rpe,
              completedAt: new Date(set.completedAt),
            })),
          },
        })),
      },
    },
  });
}

async function runCli(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && basename(process.argv[1]).includes('seed');

if (invokedDirectly) {
  runCli().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
