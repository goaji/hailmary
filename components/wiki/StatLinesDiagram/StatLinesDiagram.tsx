"use client"; // click-to-highlight state over a static stat-line mock

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./StatLinesDiagram.module.scss";

const POSITIONS = ["passing", "rushing", "receiving"] as const;
type Position = (typeof POSITIONS)[number];

// Registered in articleComponents — any Wiki page can drop <StatLinesDiagram /> into its MDX body with no per-article import.
export function StatLinesDiagram() {
  const t = useTranslations("statLinesDiagram");
  const [active, setActive] = useState<Position | null>(null);

  const positionLabel: Record<Position, string> = {
    passing: t("qbLabel"),
    rushing: t("rbLabel"),
    receiving: t("wrLabel"),
  };

  const pillLabel: Record<Position, string> = {
    passing: t("passingPill"),
    rushing: t("rushingPill"),
    receiving: t("receivingPill"),
  };

  const blurb: Record<Position, string> = {
    passing: t("passingBlurb"),
    rushing: t("rushingBlurb"),
    receiving: t("receivingBlurb"),
  };

  const columns: Record<Position, { key: string; label: string; value: string }[]> = {
    passing: [
      { key: "cmpAtt", label: t("cmpAttLabel"), value: t("qbCmpAtt") },
      { key: "yds", label: t("ydsLabel"), value: t("qbYds") },
      { key: "td", label: t("tdLabel"), value: t("qbTd") },
      { key: "int", label: t("intLabel"), value: t("qbInt") },
    ],
    rushing: [
      { key: "car", label: t("carLabel"), value: t("rbCar") },
      { key: "yds", label: t("ydsLabel"), value: t("rbYds") },
      { key: "td", label: t("tdLabel"), value: t("rbTd") },
    ],
    receiving: [
      { key: "rec", label: t("recLabel"), value: t("wrRec") },
      { key: "yds", label: t("ydsLabel"), value: t("wrYds") },
      { key: "td", label: t("tdLabel"), value: t("wrTd") },
    ],
  };

  function isDimmed(position: Position) {
    return active !== null && active !== position;
  }

  return (
    <section className={styles.diagram} aria-label={t("widgetLabel")}>
      <div className={styles.mock}>
        {POSITIONS.map((position) => (
          <table
            key={position}
            className={`${styles.table} ${isDimmed(position) ? styles.tableDim : ""}`}
          >
            <caption className={styles.tableCaption}>{positionLabel[position]}</caption>
            <thead>
              <tr>
                {columns[position].map((col) => (
                  <th key={col.key} scope="col">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columns[position].map((col) => (
                  <td key={col.key}>{col.value}</td>
                ))}
              </tr>
            </tbody>
          </table>
        ))}
      </div>

      <div className={styles.legend}>
        {POSITIONS.map((position) => (
          <button
            key={position}
            type="button"
            aria-pressed={active === position}
            className={active === position ? styles.legendItemActive : styles.legendItem}
            onClick={() => setActive((prev) => (prev === position ? null : position))}
          >
            {pillLabel[position]}
          </button>
        ))}
      </div>

      {active ? (
        <p className={styles.detailBlurb}>{blurb[active]}</p>
      ) : (
        <p className={styles.hint}>{t("hint")}</p>
      )}
    </section>
  );
}
