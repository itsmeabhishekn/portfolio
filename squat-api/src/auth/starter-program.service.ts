import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Equipment, MuscleGroup, type Prisma } from '@prisma/client';

interface StarterExercise {
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: Equipment;
}

interface StarterPrescription {
  exercise: string;
  targetSets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
}

interface StarterWorkout {
  name: string;
  notes: string;
  exercises: StarterPrescription[];
}

// Exercises are global reference data, shared by every user.
const EXERCISES: readonly StarterExercise[] = [
  {
    name: 'Barbell Bench Press',
    primaryMuscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    equipment: Equipment.BARBELL,
  },
  {
    name: 'Overhead Press',
    primaryMuscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    equipment: Equipment.BARBELL,
  },
  {
    name: 'Incline Dumbbell Press',
    primaryMuscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroups: [MuscleGroup.SHOULDERS],
    equipment: Equipment.DUMBBELL,
  },
  {
    name: 'Lateral Raise',
    primaryMuscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [],
    equipment: Equipment.DUMBBELL,
  },
  {
    name: 'Tricep Pushdown',
    primaryMuscleGroup: MuscleGroup.ARMS,
    secondaryMuscleGroups: [],
    equipment: Equipment.CABLE,
  },
  {
    name: 'Barbell Row',
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    equipment: Equipment.BARBELL,
  },
  {
    name: 'Pull-Up',
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroups: [MuscleGroup.ARMS],
    equipment: Equipment.BODYWEIGHT,
  },
  {
    name: 'Face Pull',
    primaryMuscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroups: [MuscleGroup.BACK],
    equipment: Equipment.CABLE,
  },
  {
    name: 'Back Squat',
    primaryMuscleGroup: MuscleGroup.QUADS,
    secondaryMuscleGroups: [MuscleGroup.GLUTES],
    equipment: Equipment.BARBELL,
  },
  {
    name: 'Romanian Deadlift',
    primaryMuscleGroup: MuscleGroup.HAMSTRINGS,
    secondaryMuscleGroups: [MuscleGroup.GLUTES],
    equipment: Equipment.BARBELL,
  },
  {
    name: 'Leg Press',
    primaryMuscleGroup: MuscleGroup.QUADS,
    secondaryMuscleGroups: [MuscleGroup.GLUTES],
    equipment: Equipment.MACHINE,
  },
];

// No target weights: loads are personal, and a wrong prescription is worse than an
// empty one. The lifter fills them in from the first session.
const PROGRAM = {
  name: 'Push Pull Legs',
  description: 'Three-day push / pull / legs rotation to start from.',
  workouts: [
    {
      name: 'Push A',
      notes: 'Horizontal and vertical pressing.',
      exercises: [
        {
          exercise: 'Barbell Bench Press',
          targetSets: 4,
          repMin: 5,
          repMax: 8,
          restSeconds: 180,
        },
        {
          exercise: 'Overhead Press',
          targetSets: 3,
          repMin: 8,
          repMax: 10,
          restSeconds: 150,
        },
        {
          exercise: 'Incline Dumbbell Press',
          targetSets: 3,
          repMin: 8,
          repMax: 12,
          restSeconds: 120,
        },
        {
          exercise: 'Lateral Raise',
          targetSets: 3,
          repMin: 12,
          repMax: 15,
          restSeconds: 90,
        },
        {
          exercise: 'Tricep Pushdown',
          targetSets: 3,
          repMin: 10,
          repMax: 12,
          restSeconds: 90,
        },
      ],
    },
    {
      name: 'Pull A',
      notes: 'Rows and vertical pulling.',
      exercises: [
        {
          exercise: 'Barbell Row',
          targetSets: 4,
          repMin: 6,
          repMax: 8,
          restSeconds: 150,
        },
        {
          exercise: 'Pull-Up',
          targetSets: 3,
          repMin: 6,
          repMax: 10,
          restSeconds: 120,
        },
        {
          exercise: 'Face Pull',
          targetSets: 3,
          repMin: 12,
          repMax: 15,
          restSeconds: 90,
        },
      ],
    },
    {
      name: 'Legs A',
      notes: 'Squat focus plus posterior chain.',
      exercises: [
        {
          exercise: 'Back Squat',
          targetSets: 4,
          repMin: 5,
          repMax: 5,
          restSeconds: 180,
        },
        {
          exercise: 'Romanian Deadlift',
          targetSets: 3,
          repMin: 8,
          repMax: 10,
          restSeconds: 150,
        },
        {
          exercise: 'Leg Press',
          targetSets: 3,
          repMin: 10,
          repMax: 12,
          restSeconds: 120,
        },
      ],
    },
  ] satisfies readonly StarterWorkout[],
};

@Injectable()
export class StarterProgramService {
  async provision(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<void> {
    const exerciseIds = await this.ensureExercises(tx);

    await tx.program.create({
      data: {
        userId,
        name: PROGRAM.name,
        description: PROGRAM.description,
        isActive: true,
        workouts: {
          create: PROGRAM.workouts.map((workout, workoutIndex) => ({
            name: workout.name,
            notes: workout.notes,
            order: workoutIndex + 1,
            workoutExercises: {
              create: workout.exercises.map((item, itemIndex) => ({
                exerciseId: lookup(exerciseIds, item.exercise),
                order: itemIndex + 1,
                targetSets: item.targetSets,
                repMin: item.repMin,
                repMax: item.repMax,
                restSeconds: item.restSeconds,
              })),
            },
          })),
        },
      },
    });
  }

  private async ensureExercises(
    tx: Prisma.TransactionClient,
  ): Promise<Map<string, string>> {
    const ids = new Map<string, string>();

    for (const exercise of EXERCISES) {
      const row = await tx.exercise.upsert({
        where: { name: exercise.name },
        update: {},
        create: exercise,
        select: { id: true },
      });
      ids.set(exercise.name, row.id);
    }

    return ids;
  }
}

function lookup(ids: Map<string, string>, name: string): string {
  const id = ids.get(name);
  if (id === undefined) {
    throw new InternalServerErrorException(
      `Starter program references unknown exercise "${name}".`,
    );
  }
  return id;
}
