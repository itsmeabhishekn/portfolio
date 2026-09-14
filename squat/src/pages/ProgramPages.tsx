import { Link, useParams } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { paths } from "@/config/paths";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./pages.module.css";

export function ProgramsPage() {
  const { data, error, loading } = useAsyncValue(() => api.programs.listPrograms());

  if (loading) {
    return <Spinner label="Loading programs" />;
  }

  if (error) {
    return <p className={styles.error}>{error.message}</p>;
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No programs"
        body="Programs group workout templates. None are assigned yet."
      />
    );
  }

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow="Programs" title="Training" />
      {data.map((program) => (
        <Card key={program.id}>
          <h2 className="t-exercise">{program.name}</h2>
          <p className="t-secondary">{program.description}</p>
          <Link className={styles.linkish} to={paths.program(program.id)}>
            Open program
          </Link>
        </Card>
      ))}
    </div>
  );
}

export function ProgramDetailPage() {
  const { programId } = useParams();
  const { data, error, loading } = useAsyncValue(() => {
    if (!programId) {
      return Promise.reject(new Error("Missing program."));
    }
    return api.programs.getProgram(programId).then(async (program) => {
      const allWorkouts = await api.workouts.listWorkouts();
      return {
        program,
        workouts: allWorkouts.filter((workout) =>
          program.workoutIds.includes(workout.id),
        ),
      };
    });
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
        eyebrow="Program"
        title={data.program.name}
        description={data.program.description}
      />
      {data.workouts.map((workout) => (
        <Card key={workout.id}>
          <h2 className="t-exercise">{workout.name}</h2>
          <Link className={styles.linkish} to={paths.workoutTemplate(workout.id)}>
            View template
          </Link>
        </Card>
      ))}
    </div>
  );
}
