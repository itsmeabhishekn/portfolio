export type UpcomingSource = 'in_progress' | 'rotation' | 'override';

export function nextWorkoutAfter(
  rotation: readonly { id: string }[],
  currentId: string,
): string | null {
  if (rotation.length === 0) {
    return null;
  }
  const index = rotation.findIndex((item) => item.id === currentId);
  const from = index === -1 ? 0 : index;
  return rotation[(from + 1) % rotation.length]?.id ?? null;
}

export function queuedWorkoutId(
  rotation: readonly { id: string }[],
  nextWorkoutId: string | null,
  lastCompletedWorkoutId: string | null,
): string | null {
  if (rotation.length === 0) {
    return null;
  }
  if (
    nextWorkoutId !== null &&
    rotation.some((item) => item.id === nextWorkoutId)
  ) {
    return nextWorkoutId;
  }
  if (lastCompletedWorkoutId !== null) {
    const lastIndex = rotation.findIndex(
      (item) => item.id === lastCompletedWorkoutId,
    );
    if (lastIndex >= 0) {
      return rotation[(lastIndex + 1) % rotation.length]?.id ?? null;
    }
  }
  return rotation[0]?.id ?? null;
}

export function shownWorkoutId(
  queuedId: string | null,
  overrideWorkoutId: string | null,
  rotation: readonly { id: string }[],
): string | null {
  if (
    overrideWorkoutId !== null &&
    rotation.some((item) => item.id === overrideWorkoutId)
  ) {
    return overrideWorkoutId;
  }
  return queuedId;
}
