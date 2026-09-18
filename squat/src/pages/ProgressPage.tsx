import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Badge, Card, EmptyState, PageHeader, Tabs } from "@/components/ui";
import { paths } from "@/config/paths";
import { formatDate, formatDuration, formatKg } from "@/lib/format";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import type { WorkoutHistoryItem } from "@/types/domain";
import styles from "./pages.module.css";

type ProgressTab = "sessions" | "strength" | "volume";

const TABS: readonly ProgressTab[] = ["sessions", "strength", "volume"];

function parseTab(value: string | null): ProgressTab {
  return TABS.find((tab) => tab === value) ?? "sessions";
}

async function loadProgress() {
  const [history, records, series, exerciseList] = await Promise.all([
    api.sessions.listHistory(),
    api.progress.listPersonalRecords(),
    api.progress.listExerciseProgress(),
    api.exercises.listExercises(),
  ]);
  return { history, records, series, exerciseList };
}

function SessionList({ items }: { items: readonly WorkoutHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No sessions yet"
        body="Completed workouts will show date, duration, exercises, and volume here."
      />
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <Card key={item.session.id}>
          <div className={styles.cardBody}>
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
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProgressPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get("tab"));
  const { data, error, loading } = useAsyncValue(loadProgress);

  if (loading) {
    return <Spinner label="Loading progress" />;
  }

  if (error || !data) {
    return (
      <p className={styles.error}>
        {error?.message ?? "Could not load progress."}
      </p>
    );
  }

  const namedSeries = data.series.map((entry) => ({
    ...entry,
    name:
      data.exerciseList.find((exercise) => exercise.id === entry.exerciseId)
        ?.name ?? "Exercise",
  }));

  const empty =
    data.history.length === 0 &&
    data.series.length === 0 &&
    data.records.length === 0;

  if (empty) {
    return (
      <EmptyState
        title="No progress yet"
        body="Completed sessions, personal records, and strength trends appear after you train."
      />
    );
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Progress"
        title="Log"
        description="Sessions you have completed, plus strength and volume trends."
      />

      <Tabs
        label="Progress views"
        value={tab}
        onChange={(next) => setParams({ tab: next }, { replace: true })}
        items={[
          {
            id: "sessions",
            label: "Sessions",
            panel: <SessionList items={data.history} />,
          },
          {
            id: "strength",
            label: "Strength",
            panel: (
              <div className={styles.list}>
                {namedSeries.length === 0 ? (
                  <EmptyState
                    title="No strength data"
                    body="Estimated 1RM trends appear after you complete workouts."
                  />
                ) : (
                  namedSeries.map((entry) => (
                    <Card key={entry.exerciseId}>
                      <div className={styles.row}>
                        <h2 className="t-exercise">{entry.name}</h2>
                        <span className="t-metric" style={{ fontSize: "1.35rem" }}>
                          {entry.points.at(-1)?.estimated1RmKg ?? "—"}
                        </span>
                      </div>
                      <p className="t-secondary">Estimated 1RM</p>
                      <div className={styles.chart} aria-hidden="true">
                        {entry.points.map((point) => {
                          const max = Math.max(
                            ...entry.points.map((item) => item.estimated1RmKg),
                          );
                          const height = `${Math.max(12, (point.estimated1RmKg / max) * 100)}%`;
                          return (
                            <span
                              key={point.date}
                              className={styles.bar}
                              style={{ height }}
                            />
                          );
                        })}
                      </div>
                    </Card>
                  ))
                )}
                {data.records.length > 0 ? (
                  <section className={styles.section}>
                    <h2 className="t-section">Personal records</h2>
                    {data.records.map((record) => {
                      const name =
                        data.exerciseList.find(
                          (exercise) => exercise.id === record.exerciseId,
                        )?.name ?? "Exercise";
                      return (
                        <Card key={record.id}>
                          <div className={styles.row}>
                            <h3 className="t-exercise">{name}</h3>
                            <Badge tone="success">PR</Badge>
                          </div>
                          <p className="t-secondary">
                            {record.weightKg} kg × {record.reps}
                          </p>
                        </Card>
                      );
                    })}
                  </section>
                ) : null}
              </div>
            ),
          },
          {
            id: "volume",
            label: "Volume",
            panel: (
              <div className={styles.list}>
                {namedSeries.length === 0 ? (
                  <EmptyState
                    title="No volume data"
                    body="Session volume by lift appears after you complete workouts."
                  />
                ) : (
                  namedSeries.map((entry) => (
                    <Card key={entry.exerciseId}>
                      <h2 className="t-exercise">{entry.name}</h2>
                      <p className="t-secondary">
                        Latest volume {formatKg(entry.points.at(-1)?.volumeKg ?? 0)}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
