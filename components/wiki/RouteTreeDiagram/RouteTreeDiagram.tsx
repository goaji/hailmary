"use client"; // click-to-select state over a static route fan

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./RouteTreeDiagram.module.scss";

const ROUTE_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
type RouteId = (typeof ROUTE_IDS)[number];

// Depth (y) is yard-calibrated to match YARD_LINES; lateral spread is schematic.
const ROUTE_POINTS: Record<RouteId, string> = {
  0: "100,95 150,88",
  1: "100,95 80,81",
  2: "100,95 100,73 140,73",
  3: "100,95 100,59 110,66",
  4: "100,95 100,45 130,52",
  5: "100,95 100,41 150,41",
  6: "100,95 100,48 50,48",
  7: "100,95 100,23 170,10",
  8: "100,95 100,23 70,5",
  9: "100,95 100,5",
};

// Guides at 5/10/15/20 yards, same scale as ROUTE_POINTS.
const YARD_LINES = [5, 10, 15, 20];
const yardToY = (yards: number) => 95 - (yards / 25) * 90;

// Registered in articleComponents — any Wiki page can drop <RouteTreeDiagram /> into its MDX body with no per-article import.
export function RouteTreeDiagram() {
  const t = useTranslations("routeTreeDiagram");
  const [selected, setSelected] = useState<RouteId | null>(null);

  return (
    <section className={styles.diagram} aria-label={t("widgetLabel")}>
      <svg className={styles.field} viewBox="0 0 200 100" aria-hidden="true">
        {YARD_LINES.map((yards) => {
          const y = yardToY(yards);
          return (
            <g key={yards}>
              <line className={styles.yardLine} x1={0} x2={200} y1={y} y2={y} />
              <text className={styles.yardLabel} x={4} y={y - 2}>
                {yards}
              </text>
            </g>
          );
        })}
        {ROUTE_IDS.map((id) => (
          <polyline
            key={id}
            points={ROUTE_POINTS[id]}
            className={selected === id ? styles.routeActive : styles.route}
          />
        ))}
        <circle className={styles.origin} cx={100} cy={95} r={2.5} />
      </svg>

      <div className={styles.numbers}>
        {ROUTE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={selected === id ? styles.numberActive : styles.number}
            aria-pressed={selected === id}
            onClick={() => setSelected(id)}
          >
            {id}
          </button>
        ))}
      </div>

      <div className={styles.detail} role="status">
        {selected !== null ? (
          <>
            <strong>{t(`route${selected}Label`)}</strong>
            <p>{t(`route${selected}Blurb`)}</p>
          </>
        ) : (
          <p className={styles.hint}>{t("hint")}</p>
        )}
      </div>
    </section>
  );
}
