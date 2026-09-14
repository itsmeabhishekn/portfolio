import { useCallback, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Spinner } from "@/components/feedback/Spinner";
import { PageHeader } from "@/components/ui";
import { APP_NAME } from "@/config/app";
import { paths } from "@/config/paths";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api/client";
import styles from "./pages.module.css";

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

  if (status === "loading") {
    return <Spinner label="Checking your session" />;
  }

  if (status === "authenticated") {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow={APP_NAME}
        title="Sign in"
        description="Squat uses your Google account. Your first sign-in creates a starter program."
      />

      <GoogleSignInButton onCredential={onCredential} onError={onError} />

      {busy ? <Spinner label="Signing you in" /> : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
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
