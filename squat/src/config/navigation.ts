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
    { key: "progress", label: "Progress", to: paths.progress },
    { key: "history", label: "History", to: paths.history },
    { key: "profile", label: "Profile", to: paths.profile },
  ];
}
