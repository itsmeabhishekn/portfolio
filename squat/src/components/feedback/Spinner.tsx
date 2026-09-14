import { cx } from "@/lib/cx";
import styles from "./Feedback.module.css";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.center} role="status" aria-label={label}>
      <div className={styles.spinner} />
    </div>
  );
}

export function Skeleton({
  width = "100%",
  height = "1rem",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <span
      className={cx(styles.skeleton)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
