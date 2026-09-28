import { useId, type ReactNode } from "react";
import { Card } from "@/components/ui/Card/Card";
import styles from "./Panel.module.scss";

type PanelProps = {
  heading: string;
  children: ReactNode;
};

export function Panel({ heading, children }: PanelProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={styles.panel}>
      <Card>
        <h2 id={headingId} className={styles.heading}>
          {heading}
        </h2>
        {children}
      </Card>
    </section>
  );
}
