import { Link } from "react-router-dom";
import { Button, Input, PageHeader } from "@/components/ui";
import { APP_NAME } from "@/config/app";
import { paths } from "@/config/paths";
import styles from "./pages.module.css";

export function LoginPage() {
  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow={APP_NAME}
        title="Sign in"
        description="Auth is a shell for now. The API layer is ready for a later NestJS swap."
      />
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Input label="Email" type="email" autoComplete="email" />
        <Input label="Password" type="password" autoComplete="current-password" />
        <Button type="submit" fullWidth>
          Continue
        </Button>
      </form>
      <p className="t-secondary">
        Need an account?{" "}
        <Link className={styles.linkish} to={paths.register}>
          Register
        </Link>
      </p>
      <Link className={styles.linkish} to={paths.dashboard}>
        Skip to app
      </Link>
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className={styles.stack}>
      <PageHeader eyebrow={APP_NAME} title="Create account" />
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Input label="Name" autoComplete="name" />
        <Input label="Email" type="email" autoComplete="email" />
        <Input label="Password" type="password" autoComplete="new-password" />
        <Button type="submit" fullWidth>
          Create account
        </Button>
      </form>
      <Link className={styles.linkish} to={paths.login}>
        Back to sign in
      </Link>
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
