import type { ReactNode } from "react";
import { Link } from "@/i18n";
import styles from "./StatusPanel.module.scss";

type StatusPanelProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  /** Extra actions rendered before the back link, e.g. error.tsx's retry button. */
  children?: ReactNode;
};

export function StatusPanel({
  title,
  description,
  backHref,
  backLabel,
  children,
}: StatusPanelProps) {
  return (
    <div className={styles.statusPanel}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        {children}
        <Link href={backHref} className={styles.backLink}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
