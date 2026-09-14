import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {eyebrow ? <p className="t-meta">{eyebrow}</p> : null}
      <div className={styles.row}>
        <h1 className="t-page-title">{title}</h1>
        {action}
      </div>
      {description ? <p className="t-secondary">{description}</p> : null}
    </header>
  );
}
