import { Link } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { paths } from "@/config/paths";
import { formatDate, formatDuration, formatKg } from "@/lib/format";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./pages.module.css";

export function HistoryPage() {
  const { data, error, loading } = useAsyncValue(() => api.sessions.listHistory());

  if (loading) {
    return <Spinner label="Loading history" />;
  }

  if (error) {
    return <p className={styles.error}>{error.message}</p>;
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No sessions yet"
        body="Completed workouts will show date, duration, exercises, and volume here."
      />
    );
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="History"
        title="Sessions"
        description="Performed workouts, separate from program templates."
      />
      {data.map((item) => (
        <Card key={item.session.id}>
          <div className={styles.row}>
            <h2 className="t-exercise">{item.session.name}</h2>
            <span className="t-meta">{formatDate(item.session.startedAt)}</span>
          </div>
          <p className="t-secondary">
            {item.session.durationMinutes
              ? formatDuration(item.session.durationMinutes)
              : "Duration n/a"}
            {" · "}
            {item.setCount} sets · {formatKg(item.volumeKg)}
          </p>
          <p className="t-secondary">{item.exerciseNames.join(" · ")}</p>
          <Link
            className={styles.linkish}
            to={paths.workoutSession(item.session.id)}
          >
            Open session
          </Link>
        </Card>
      ))}
    </div>
  );
}
