import { NavLink, useLocation } from "react-router-dom";
import { getPrimaryNav, isPrimaryNavActive } from "@/config/navigation";
import type { NavKey } from "@/types/navigation";
import {
  HomeIcon,
  LibraryIcon,
  ProfileIcon,
  ProgressIcon,
  WorkoutIcon,
} from "@/components/navigation/NavIcons";
import { cx } from "@/lib/cx";
import styles from "./BottomNav.module.css";

const icons: Record<NavKey, typeof HomeIcon> = {
  home: HomeIcon,
  workout: WorkoutIcon,
  library: LibraryIcon,
  progress: ProgressIcon,
  profile: ProfileIcon,
};

export function BottomNav({
  activeSessionId,
  upcomingWorkoutId,
}: {
  activeSessionId: string | null;
  upcomingWorkoutId: string | null;
}) {
  const { pathname } = useLocation();
  const items = getPrimaryNav(activeSessionId, upcomingWorkoutId);
  const workoutTo =
    items.find((item) => item.key === "workout")?.to ?? "/dashboard";

  return (
    <nav className={`glass ${styles.nav}`} aria-label="Primary">
      {items.map((item) => {
        const Icon = icons[item.key];
        const active = isPrimaryNavActive(item.key, pathname, workoutTo);
        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={cx(styles.item, active && styles.active)}
          >
            <Icon />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
