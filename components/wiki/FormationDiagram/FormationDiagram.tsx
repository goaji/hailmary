"use client"; // click-to-select state over a static formation

import { useState } from "react";
import styles from "./FormationDiagram.module.scss";

export type FormationPosition = {
  id: string;
  label: string;
  blurb: string;
};

export type FormationDot = {
  /** Matches a FormationPosition.id. */
  position: string;
  /** Percentages within the field area — a simplified formation, not tactically exact. */
  x: number;
  y: number;
};

type FormationDiagramProps = {
  widgetLabel: string;
  hint: string;
  positions: FormationPosition[];
  dots: FormationDot[];
};

// Shared by every "clickable formation" hero page (offensive/defensive positions) — only the data (positions, dot layout, translations) differs per wrapper.
export function FormationDiagram({ widgetLabel, hint, positions, dots }: FormationDiagramProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = positions.find((position) => position.id === selected);

  return (
    <section className={styles.diagram} aria-label={widgetLabel}>
      <div className={styles.field}>
        {dots.map((dot, index) => (
          <button
            key={index}
            type="button"
            className={selected === dot.position ? styles.dotActive : styles.dot}
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            aria-pressed={selected === dot.position}
            onClick={() => setSelected(dot.position)}
          >
            {dot.position.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.detail} role="status">
        {active ? (
          <>
            <strong>{active.label}</strong>
            <p>{active.blurb}</p>
          </>
        ) : (
          <p className={styles.hint}>{hint}</p>
        )}
      </div>
    </section>
  );
}
