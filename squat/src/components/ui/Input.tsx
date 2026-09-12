import type { InputHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Input({
  label,
  hint,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input id={inputId} className={cx(styles.input, className)} {...props} />
      {hint ? <span className="t-secondary">{hint}</span> : null}
    </label>
  );
}

export interface NumberInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  disabled = false,
}: NumberInputProps) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-number`;

  const nudge = (direction: 1 | -1) => {
    const current = value ?? 0;
    const next = Number((current + direction * step).toFixed(2));
    onChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {suffix ? <span className={styles.suffix}> · {suffix}</span> : null}
      </label>
      <div className={styles.numberWrap}>
        <button
          type="button"
          className={styles.step}
          aria-label={`Decrease ${label}`}
          disabled={disabled}
          onClick={() => nudge(-1)}
        >
          −
        </button>
        <input
          id={inputId}
          className={styles.input}
          inputMode="decimal"
          type="text"
          disabled={disabled}
          value={value ?? ""}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) {
              onChange(parsed);
            }
          }}
        />
        <button
          type="button"
          className={styles.step}
          aria-label={`Increase ${label}`}
          disabled={disabled}
          onClick={() => nudge(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
