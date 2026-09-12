import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { paths } from "@/config/paths";
import { firstName, formatDate, greetingForHour } from "@/lib/format";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import styles from "./pages.module.css";

async function loadDashboard() {
  const [user, programList, sessionList, history, records] = await Promise.all([
    api.auth.getCurrentUser(),
    api.programs.listPrograms(),
    api.sessions.listSessions(),
    api.sessions.listHistory(),
    api.progress.listPersonalRecords(),
  ]);

  const activeId = api.sessions.getActiveSessionId();
  const current = sessionList.find((session) => session.id === activeId) ?? null;
  const program = programList[0] ?? null;
  const recent = history[0] ?? null;

  return { user, program, current, recent, recordCount: records.length };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, error, loading } = useAsyncValue(loadDashboard);

  if (loading) {
    return <Spinner label="Loading dashboard" />;
  }

  if (error || !data?.user) {
    return <p className={styles.error}>{error?.message ?? "Could not load dashboard."}</p>;
  }

  const hour = new Date().getHours();
  const activeSessionId = api.sessions.getActiveSessionId();

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Home"
        title={`${greetingForHour(hour)}, ${firstName(data.user.displayName)}`}
        description={
          data.program
            ? `Current program · ${data.program.name}`
            : "No program selected yet."
        }
      />

      <Card>
        <p className="t-meta">Up next</p>
        <div className={styles.row} style={{ marginTop: "0.75rem" }}>
          <div>
            <h2 className="t-exercise">{data.current?.name ?? "Empty session"}</h2>
            <p className="t-secondary">Log sets, rest, and keep moving.</p>
          </div>
          {data.current ? <Badge tone="accent">In progress</Badge> : null}
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <Button
            fullWidth
            onClick={() => navigate(paths.workoutSession(activeSessionId))}
          >
            Quick Start Workout
          </Button>
        </div>
      </Card>

      {data.recent ? (
        <Card>
          <p className="t-meta">Recent</p>
          <h2 className="t-exercise" style={{ marginTop: "0.5rem" }}>
            {data.recent.session.name}
          </h2>
          <p className="t-secondary">
            {formatDate(data.recent.session.startedAt)}
            {data.recent.session.durationMinutes
              ? ` · ${data.recent.session.durationMinutes} min`
              : ""}
          </p>
        </Card>
      ) : null}

      <Card>
        <p className="t-meta">Progress</p>
        <p className="t-metric" style={{ marginTop: "0.5rem" }}>
          {data.recordCount}
        </p>
        <p className="t-secondary">Personal records on file</p>
      </Card>
    </div>
  );
}
