import { Skeleton } from "@/components/feedback/Spinner";
import { LoadError } from "@/components/feedback/LoadError";
import { firstName, greetingForHour } from "@/lib/format";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { loadDashboard } from "@/features/dashboard/loadDashboard";
import { ProgressSnapshot } from "@/features/dashboard/ProgressSnapshot";
import { RecentWorkout } from "@/features/dashboard/RecentWorkout";
import { TodayWorkout } from "@/features/dashboard/TodayWorkout";
import styles from "./dashboard.module.css";

function DashboardSkeleton() {
  return (
    <div className={styles.skeletonStack} aria-busy="true" aria-live="polite">
      <Skeleton width="55%" height="2rem" />
      <Skeleton width="70%" height="1rem" />
      <Skeleton height="12rem" />
      <Skeleton width="30%" height="0.75rem" />
      <Skeleton height="3.5rem" />
    </div>
  );
}

export function DashboardPage() {
  const { data, error, loading, reload } = useAsyncValue(loadDashboard);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <LoadError
        body="We couldn't load your training day."
        onRetry={reload}
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.greeting}>
          {greetingForHour(new Date().getHours())}, {firstName(data.user.displayName)}
        </p>
        <p className={styles.prompt}>Ready for your next workout?</p>
      </header>

      <TodayWorkout today={data.today} />
      <RecentWorkout recent={data.recent} />
      <ProgressSnapshot pr={data.pr} streak={data.streak} />
    </div>
  );
}
