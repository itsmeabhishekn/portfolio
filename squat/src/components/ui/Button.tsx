import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        size !== "md" && styles[size],
        fullWidth && styles.full,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  children: ReactNode;
}

export function IconButton({
  label,
  variant = "ghost",
  className,
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(
        styles.button,
        styles[variant],
        styles.icon,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
