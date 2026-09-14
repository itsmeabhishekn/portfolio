import { Button, Card, PageHeader, SegmentedControl } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import type { ThemePreference } from "@/config/theme";
import styles from "./pages.module.css";

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { preference, setPreference } = useTheme();
  const { pushToast } = useToast();

  if (!user) {
    return <p className={styles.error}>Not signed in.</p>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow="Profile" title={user.displayName} description={user.email} />

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
          Units, rest timers, and equipment preferences will land here.
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

      <Card>
        <p className="t-meta">Account</p>
        <p className="t-secondary" style={{ marginTop: "0.5rem" }}>
          Signed in with Google as {user.email}.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
