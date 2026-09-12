import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Tabs.module.css";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  panel: ReactNode;
}

interface TabsProps<T extends string> {
  label: string;
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({
  label,
  items,
  value,
  onChange,
}: TabsProps<T>) {
  const selected = items.find((item) => item.id === value) ?? items[0];

  if (!selected) {
    return null;
  }

  return (
    <div>
      <div className={styles.tablist} role="tablist" aria-label={label}>
        {items.map((item) => {
          const isSelected = item.id === selected.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={cx(styles.tab, isSelected && styles.selected)}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className={styles.panel}>
        {selected.panel}
      </div>
    </div>
  );
}
