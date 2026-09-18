import { Link, useParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { paths } from "@/config/paths";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./pages.module.css";

export function ProgramDetailPage() {
  const { programId } = useParams();
  const { data, error, loading } = useAsyncValue(() => {
    if (!programId) {
      return Promise.reject(new Error("Missing program."));
    }
    return api.programs.getProgramDetail(programId);
  }, programId ?? "missing-program");

  if (loading) {
    return <Spinner label="Loading program" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Program not found."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow={data.program.isActive ? "Active program" : "Program"}
        title={data.program.name}
        description={data.program.description}
      />
      {data.workouts.length === 0 ? (
        <EmptyState
          title="No workouts"
          body="This program does not have workout templates yet."
        />
      ) : (
        data.workouts.map((workout) => (
          <Card key={workout.id}>
            <div className={styles.cardBody}>
              <div className={styles.row}>
                <h2 className="t-exercise">{workout.name}</h2>
                {workout.inProgress ? <Badge tone="accent">Live</Badge> : null}
              </div>
              {workout.notes ? (
                <p className="t-secondary">{workout.notes}</p>
              ) : null}
              <p className="t-meta">
                {workout.exerciseCount}{" "}
                {workout.exerciseCount === 1 ? "exercise" : "exercises"}
                {" · "}~{workout.estimatedMinutes} min
              </p>
              <Link
                className={styles.linkish}
                to={paths.workoutTemplate(workout.id)}
              >
                View template
              </Link>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
