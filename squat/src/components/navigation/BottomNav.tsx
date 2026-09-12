import { NavLink } from "react-router-dom";
import { getPrimaryNav } from "@/config/navigation";
import type { NavKey } from "@/types/navigation";
import {
  HistoryIcon,
  HomeIcon,
  ProfileIcon,
  ProgressIcon,
  WorkoutIcon,
} from "@/components/navigation/NavIcons";
import { cx } from "@/lib/cx";
import styles from "./BottomNav.module.css";

const icons: Record<NavKey, typeof HomeIcon> = {
  home: HomeIcon,
  workout: WorkoutIcon,
  progress: ProgressIcon,
  history: HistoryIcon,
  profile: ProfileIcon,
};

export function BottomNav({ activeSessionId }: { activeSessionId: string }) {
  const items = getPrimaryNav(activeSessionId);

  return (
    <nav className={`glass ${styles.nav}`} aria-label="Primary">
      {items.map((item) => {
        const Icon = icons[item.key];
        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              cx(styles.item, isActive && styles.active)
            }
          >
            <Icon />
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
