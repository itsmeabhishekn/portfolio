import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cx(styles.card, className)} {...props}>
      {children}
    </div>
  );
}

export interface InteractiveCardProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function InteractiveCard({
  className,
  children,
  type = "button",
  ...props
}: InteractiveCardProps) {
  return (
    <button
      type={type}
      className={cx(styles.card, styles.interactive, className)}
      {...props}
    >
      {children}
    </button>
  );
}
