import { describe, expect, it } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import {
  ExerciseCatalogParseError,
  loadExerciseCatalog,
  mapEquipmentLabel,
  mapFocusToMuscleGroup,
  parseExerciseCatalog,
} from './exercise-catalog.js';

const catalogPath = fileURLToPath(
  new URL('../../data/exercises/taxonomy.json', import.meta.url),
);

function sampleRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'EX_CHEST_UPP_002',
    region: 'Chest',
    muscle_group: 'Upper Chest',
    target_subdivision: 'Clavicular Pectoralis Major',
    exercise_name: 'Incline Dumbbell Bench Press',
    equipment: 'Dumbbell, Incline Bench',
    movement_pattern: 'Incline Horizontal Push',
    mechanics: 'Compound',
    acl_friendly: true,
    shoulder_impingement_risk: 'Low',
    ...overrides,
  };
}

describe('exercise taxonomy mapping', () => {
  it('maps focus groups onto the existing muscle enum', () => {
    expect(mapFocusToMuscleGroup('Upper Chest')).toBe('chest');
    expect(mapFocusToMuscleGroup('Calves')).toBe('calves');
    expect(mapFocusToMuscleGroup('Adductors')).toBe('adductors');
    expect(mapFocusToMuscleGroup('Deep Core')).toBe('core');
    expect(() => mapFocusToMuscleGroup('Neck')).toThrow(
      ExerciseCatalogParseError,
    );
  });

  it('maps equipment labels onto the existing equipment enum', () => {
    expect(mapEquipmentLabel('Dual Cable Pulley')).toBe('cable');
    expect(mapEquipmentLabel('Dumbbell, Incline Bench')).toBe('dumbbell');
    expect(mapEquipmentLabel('Barbell, Squat Rack')).toBe('barbell');
    expect(mapEquipmentLabel('Smith Machine, Incline Bench')).toBe('machine');
    expect(mapEquipmentLabel('Bodyweight, Bench')).toBe('bodyweight');
    expect(mapEquipmentLabel('Heavy Resistance Band')).toBe('other');
  });
});

describe('parseExerciseCatalog', () => {
  it('loads the master taxonomy file', () => {
    const catalog = loadExerciseCatalog(catalogPath);
    expect(catalog.exercises.length).toBeGreaterThan(100);
    expect(
      catalog.exercises.find((item) => item.catalogKey === 'EX_CHEST_UPP_002'),
    ).toMatchObject({
      name: 'Incline Dumbbell Bench Press',
      primaryMuscleGroup: 'chest',
      equipment: 'dumbbell',
      aclFriendly: true,
    });
    expect(
      catalog.exercises.find((item) => item.catalogKey === 'EX_LEG_CAL_001'),
    ).toMatchObject({
      name: 'Standing Calf Raise',
      primaryMuscleGroup: 'calves',
    });
    expect(
      catalog.exercises.find((item) => item.catalogKey === 'EX_BACK_LBR_001')
        ?.aclFriendly,
    ).toBe(false);
  });

  it('rejects a total_records mismatch and unknown keys', () => {
    const catalog = {
      database_metadata: {
        version: '2.0',
        description: 'test',
        total_records: 2,
      },
      exercises: [sampleRecord()],
    };
    expect(() => parseExerciseCatalog(catalog)).toThrow(/total_records/);

    const extra = {
      database_metadata: {
        version: '2.0',
        description: 'test',
        total_records: 1,
      },
      exercises: [sampleRecord({ rpe: 8 })],
    };
    expect(() => parseExerciseCatalog(extra)).toThrow(/unknown key "rpe"/);
  });
});
