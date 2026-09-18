import { paths } from "@/config/paths";
import type { NavKey } from "@/types/navigation";

export interface NavItem {
  key: NavKey;
  label: string;
  to: string;
}

export function getPrimaryNav(
  activeSessionId: string | null,
  upcomingWorkoutId: string | null,
): readonly NavItem[] {
  const workoutTo = activeSessionId
    ? paths.workoutSession(activeSessionId)
    : upcomingWorkoutId
      ? paths.workoutTemplate(upcomingWorkoutId)
      : paths.dashboard;

  return [
    { key: "home", label: "Home", to: paths.dashboard },
    { key: "workout", label: "Workout", to: workoutTo },
    { key: "library", label: "Library", to: paths.library },
    { key: "progress", label: "Progress", to: paths.progress },
    { key: "profile", label: "Profile", to: paths.profile },
  ];
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isPrimaryNavActive(
  key: NavKey,
  pathname: string,
  workoutTo: string,
): boolean {
  const path = normalizePath(pathname);
  const workoutTarget = normalizePath(workoutTo);

  switch (key) {
    case "home":
      return path === paths.dashboard;
    case "workout":
      return (
        path.startsWith("/workout/") ||
        (workoutTarget.startsWith("/workouts/") && path === workoutTarget)
      );
    case "library":
      return (
        path === paths.library ||
        path.startsWith("/programs") ||
        path.startsWith("/exercises") ||
        (path.startsWith("/workouts/") && path !== workoutTarget)
      );
    case "progress":
      return path === paths.progress || path === paths.history;
    case "profile":
      return path === paths.profile;
  }
}
