import { useCallback, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PageHeader } from "@/components/ui";
import { APP_DESCRIPTION, APP_NAME } from "@/config/app";
import { paths } from "@/config/paths";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api/client";
import auth from "@/features/auth/auth.module.css";
import styles from "./pages.module.css";

function SquatMark() {
  return (
    <div className={auth.mark} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M4 16h24"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="2" y="10" width="5" height="12" rx="1.4" fill="currentColor" />
        <rect x="25" y="10" width="5" height="12" rx="1.4" fill="currentColor" />
        <rect x="7.5" y="12.5" width="2.2" height="7" rx="0.8" fill="currentColor" />
        <rect x="22.3" y="12.5" width="2.2" height="7" rx="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}

function PointIcon({ d }: { d: string }) {
  return (
    <span className={auth.pointIcon} aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path
          d={d}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const POINTS = [
  {
    title: "Log every working set",
    body: "Weight, reps, and rest stay on the session — not in a notes app.",
    icon: "M2.5 12.5 6 4.5l3 5 1.5-2.5 3 5.5",
  },
  {
    title: "See the trend, not a dump",
    body: "Progress is built from what you actually lift, session after session.",
    icon: "M2 12h12M4 9l2.5-3 2.5 2L13 4",
  },
  {
    title: "An empty start on purpose",
    body: "First sign-in creates your account only. Nothing is preloaded.",
    icon: "M3 8h10M8 3v10",
  },
] as const;

export function LoginPage() {
  const { status, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onCredential = useCallback(
    (credential: string) => {
      setError(null);
      setBusy(true);
      signIn(credential)
        .catch((caught: unknown) => {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "We couldn't sign you in. Try again.",
          );
        })
        .finally(() => {
          setBusy(false);
        });
    },
    [signIn],
  );

  const onError = useCallback((message: string) => {
    setError(message);
  }, []);

  if (status === "authenticated") {
    return <Navigate to={paths.dashboard} replace />;
  }

  const checking = status === "loading";

  return (
    <div className={auth.page}>
      <header className={auth.brand}>
        <SquatMark />
        <div className={auth.copy}>
          <p className={`t-meta ${auth.kicker}`}>{APP_NAME}</p>
          <h1 className={auth.title}>Train with a log that stays yours.</h1>
          <p className={`t-secondary ${auth.lede}`}>{APP_DESCRIPTION}</p>
        </div>
      </header>

      <ul className={auth.points}>
        {POINTS.map((point) => (
          <li key={point.title} className={auth.point}>
            <PointIcon d={point.icon} />
            <div className={auth.pointCopy}>
              <p className={auth.pointTitle}>{point.title}</p>
              <p className="t-secondary">{point.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className={auth.panel} aria-label="Sign in">
        <div className={auth.panelHead}>
          <h2 className={auth.panelTitle}>Continue with Google</h2>
          <p className="t-secondary">
            No password. Use the same account every time you train.
          </p>
        </div>
        {checking || busy ? (
          <div
            className={auth.well}
            role="status"
            aria-label={checking ? "Checking your session" : "Signing you in"}
          >
            <span className={auth.spinner} />
          </div>
        ) : (
          <div className={auth.well}>
            <GoogleSignInButton onCredential={onCredential} onError={onError} />
          </div>
        )}
        {error ? (
          <p className={auth.alert} role="alert">
            {error}
          </p>
        ) : (
          <p className={`t-secondary ${auth.note}`}>
            Google only confirms who you are. Squat never sees a password.
          </p>
        )}
      </section>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className={styles.stack}>
      <PageHeader title="Not found" description="That route is not in Squat yet." />
      <Link className={styles.linkish} to={paths.dashboard}>
        Go home
      </Link>
    </div>
  );
}
