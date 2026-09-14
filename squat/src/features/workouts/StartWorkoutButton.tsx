import { Button } from "@/components/ui";
import styles from "./template.module.css";

interface StartWorkoutButtonProps {
  label: string;
  pending: boolean;
  onStart: () => void;
}

export function StartWorkoutButton({
  label,
  pending,
  onStart,
}: StartWorkoutButtonProps) {
  return (
    <div className={`glass ${styles.bar}`}>
      <Button size="lg" disabled={pending} onClick={onStart}>
        {pending ? "Starting…" : label}
      </Button>
    </div>
  );
}
