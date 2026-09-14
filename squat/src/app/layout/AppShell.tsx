import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./AppShell.module.css";

export function AppShell() {
  const location = useLocation();
  const { data } = useAsyncValue(
    () => api.sessions.getWorkoutTabTarget(),
    `workout-nav:${location.pathname}`,
  );

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav
        activeSessionId={data?.activeSessionId ?? null}
        upcomingWorkoutId={data?.upcomingWorkoutId ?? null}
      />
    </div>
  );
}
