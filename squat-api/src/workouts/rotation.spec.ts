import { describe, expect, it } from '@jest/globals';
import {
  nextWorkoutAfter,
  queuedWorkoutId,
  shownWorkoutId,
} from './rotation.js';

const rotation = [{ id: 'push' }, { id: 'pull' }, { id: 'legs' }];

describe('rotation', () => {
  it('wraps skip to the first day after the last', () => {
    expect(nextWorkoutAfter(rotation, 'legs')).toBe('push');
    expect(nextWorkoutAfter(rotation, 'push')).toBe('pull');
  });

  it('prefers an explicit cursor over last completed', () => {
    expect(queuedWorkoutId(rotation, 'legs', 'push')).toBe('legs');
  });

  it('falls back to the day after last completed when the cursor is missing', () => {
    expect(queuedWorkoutId(rotation, null, 'push')).toBe('pull');
    expect(queuedWorkoutId(rotation, 'missing', null)).toBe('push');
  });

  it('shows an override without moving the queued day', () => {
    expect(shownWorkoutId('push', 'pull', rotation)).toBe('pull');
    expect(shownWorkoutId('push', 'missing', rotation)).toBe('push');
  });
});
