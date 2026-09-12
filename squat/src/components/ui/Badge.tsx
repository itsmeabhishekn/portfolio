import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Badge.module.css";

type BadgeTone = "neutral" | "accent" | "success";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>;
}
