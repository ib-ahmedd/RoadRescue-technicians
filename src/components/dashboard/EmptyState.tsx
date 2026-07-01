import type { ReactNode } from "react";
import styles from "@/app/dashboard/Dashboard.module.css";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export default function EmptyState({ icon, title, subtitle, children }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptySub}>{subtitle}</p>
      {children}
    </div>
  );
}
