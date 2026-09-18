import { describe, expect, it } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import {
  CatalogParseError,
  loadProgramCatalog,
  parseProgramCatalog,
  type ProgramCatalog,
} from './program-catalog.js';

const catalogPath = fileURLToPath(
  new URL('../../data/programs/hypertrophy-stability.json', import.meta.url),
);

function validCatalog(): ProgramCatalog {
  return {
    exercises: [
      {
        name: 'Dumbbell Romanian Deadlift',
        description: 'Hinge.',
        primaryMuscleGroup: 'hamstrings',
        secondaryMuscleGroups: ['glutes'],
        equipment: 'dumbbell',
      },
    ],
    program: {
      name: 'Test Split',
      description: 'One session.',
      isActive: true,
      workouts: [
        {
          name: 'Lower A',
          notes: 'Hinge day.',
          order: 1,
          exercises: [
            {
              exerciseName: 'Dumbbell Romanian Deadlift',
              order: 1,
              targetSets: 3,
              repMin: 8,
              repMax: 10,
              targetWeightKg: null,
              restSeconds: 150,
            },
          ],
        },
      ],
    },
  };
}

describe('parseProgramCatalog', () => {
  it('loads the hypertrophy stability catalog', () => {
    const catalog = loadProgramCatalog(catalogPath);
    expect(catalog.program.name).toBe(
      '5-Day Rolling Hypertrophy & Stability Split',
    );
    expect(catalog.program.workouts).toHaveLength(5);
    expect(catalog.exercises).toHaveLength(25);
    expect(catalog.program.workouts[0]?.name).toBe('Lower Body A');
    expect(catalog.program.workouts[2]?.exercises[0]).toMatchObject({
      exerciseName: 'Smith Machine Squat',
      targetWeightKg: 40,
      repMin: 6,
      repMax: 8,
    });
  });

  it('rejects unknown keys so leftover fields cannot silently no-op', () => {
    const catalog = validCatalog() as unknown as Record<string, unknown>;
    catalog.schedule_type = 'Rolling';
    expect(() => parseProgramCatalog(catalog)).toThrow(CatalogParseError);
    expect(() => parseProgramCatalog(catalog)).toThrow(
      /unknown key "schedule_type"/,
    );
  });

  it('rejects an exercise name that is not in the catalog', () => {
    const catalog = validCatalog();
    catalog.program.workouts[0]!.exercises[0]!.exerciseName = 'Missing Lift';
    expect(() => parseProgramCatalog(catalog)).toThrow(/not in exercises/);
  });

  it('rejects invalid muscle groups and inverted rep ranges', () => {
    const muscle = validCatalog() as unknown as {
      exercises: { primaryMuscleGroup: string }[];
    };
    muscle.exercises[0]!.primaryMuscleGroup = 'neck';
    expect(() => parseProgramCatalog(muscle)).toThrow(/muscle group/);

    const reps = validCatalog();
    reps.program.workouts[0]!.exercises[0]!.repMin = 12;
    reps.program.workouts[0]!.exercises[0]!.repMax = 8;
    expect(() => parseProgramCatalog(reps)).toThrow(/repMin must be <= repMax/);
  });
});
