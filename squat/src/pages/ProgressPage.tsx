import { useState } from "react";
import { Spinner } from "@/components/feedback/Spinner";
import { Badge, Card, PageHeader, Tabs } from "@/components/ui";
import { formatKg } from "@/lib/format";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./pages.module.css";

type ProgressTab = "strength" | "volume";

async function loadProgress() {
  const [records, series, exerciseList] = await Promise.all([
    api.progress.listPersonalRecords(),
    api.progress.listExerciseProgress(),
    api.exercises.listExercises(),
  ]);
  return { records, series, exerciseList };
}

export function ProgressPage() {
  const { data, error, loading } = useAsyncValue(loadProgress);
  const [tab, setTab] = useState<ProgressTab>("strength");

  if (loading) {
    return <Spinner label="Loading progress" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Could not load progress."}</p>;
  }

  const namedSeries = data.series.map((entry) => ({
    ...entry,
    name:
      data.exerciseList.find((exercise) => exercise.id === entry.exerciseId)?.name ??
      "Exercise",
  }));

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Progress"
        title="Strength"
        description="Lightweight trend placeholders until charts are introduced deliberately."
      />

      <Tabs
        label="Progress views"
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "strength",
            label: "Strength",
            panel: (
              <div className={styles.list}>
                {namedSeries.map((entry) => (
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
                ))}
              </div>
            ),
          },
          {
            id: "volume",
            label: "Volume",
            panel: (
              <div className={styles.list}>
                {namedSeries.map((entry) => (
                  <Card key={entry.exerciseId}>
                    <h2 className="t-exercise">{entry.name}</h2>
                    <p className="t-secondary">
                      Latest volume{" "}
                      {formatKg(entry.points.at(-1)?.volumeKg ?? 0)}
                    </p>
                  </Card>
                ))}
              </div>
            ),
          },
        ]}
      />

      <section className={styles.section}>
        <h2 className="t-section">Personal records</h2>
        {data.records.map((record) => {
          const name =
            data.exerciseList.find((exercise) => exercise.id === record.exerciseId)
              ?.name ?? "Exercise";
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
    </div>
  );
}
