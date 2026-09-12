import { Link } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { Button, Card, PageHeader, SegmentedControl } from "@/components/ui";
import { paths } from "@/config/paths";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { useAsyncValue } from "@/hooks/useAsyncValue";
import { api } from "@/services/api";
import type { ThemePreference } from "@/config/theme";
import styles from "./pages.module.css";

export function ProfilePage() {
  const { data, error, loading } = useAsyncValue(() => api.auth.getCurrentUser());
  const { preference, setPreference } = useTheme();
  const { pushToast } = useToast();

  if (loading) {
    return <Spinner label="Loading profile" />;
  }

  if (error || !data) {
    return <p className={styles.error}>{error?.message ?? "Not signed in."}</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow="Profile" title={data.displayName} description={data.email} />

      <Card>
        <p className="t-meta">Units</p>
        <p className="t-exercise" style={{ marginTop: "0.4rem" }}>
          {data.unit.toUpperCase()}
        </p>
      </Card>

      <section className={styles.section}>
        <h2 className="t-section">Appearance</h2>
        <SegmentedControl
          label="Theme preference"
          value={preference}
          onChange={(value: ThemePreference) => setPreference(value)}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </section>

      <Card>
        <p className="t-meta">Settings</p>
        <p className="t-secondary" style={{ marginTop: "0.5rem" }}>
          Account, rest timers, and equipment preferences will land here.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <Button
            variant="secondary"
            onClick={() => pushToast("Settings are not connected yet.")}
          >
            More settings
          </Button>
        </div>
      </Card>

      <p className="t-secondary">
        <Link className={styles.linkish} to={paths.login}>
          Auth screens
        </Link>
      </p>
    </div>
  );
}
