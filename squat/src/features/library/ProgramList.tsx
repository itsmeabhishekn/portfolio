import { Link } from "react-router-dom";
import { Badge, Card, EmptyState } from "@/components/ui";
import { paths } from "@/config/paths";
import type { ProgramListItem } from "@/types/domain";
import styles from "@/pages/pages.module.css";

export function ProgramList({
  programs,
}: {
  programs: readonly ProgramListItem[];
}) {
  if (programs.length === 0) {
    return (
      <EmptyState
        title="No programs"
        body="A program is a split assigned to your account. Import one for the email you sign in with."
      />
    );
  }

  return (
    <div className={styles.list}>
      {programs.map((program) => (
        <Card key={program.id}>
          <div className={styles.cardBody}>
            <div className={styles.row}>
              <h2 className="t-exercise">{program.name}</h2>
              {program.isActive ? <Badge tone="accent">Active</Badge> : null}
            </div>
            <p className="t-secondary">{program.description}</p>
            <p className="t-meta">
              {program.workoutCount}{" "}
              {program.workoutCount === 1 ? "workout" : "workouts"}
            </p>
            <Link className={styles.linkish} to={paths.program(program.id)}>
              Open program
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
