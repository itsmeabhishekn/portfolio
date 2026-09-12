import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/navigation/BottomNav";
import { api } from "@/services/api";
import styles from "./AppShell.module.css";

export function AppShell() {
  const activeSessionId = api.sessions.getActiveSessionId();
  const upcomingWorkoutId = api.workouts.getUpcomingWorkoutId();

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav
        activeSessionId={activeSessionId}
        upcomingWorkoutId={upcomingWorkoutId}
      />
    </div>
  );
}
