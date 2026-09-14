"use client"; // click-to-highlight state over a static diagram

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./FieldDiagram.module.scss";

const FEATURES = ["yard-lines", "hash-marks", "end-zones", "red-zone"] as const;
type Feature = (typeof FEATURES)[number];

const FEATURE_LABEL_KEYS: Record<Feature, string> = {
  "yard-lines": "hotspotYardLines",
  "hash-marks": "hotspotHashMarks",
  "end-zones": "hotspotEndZones",
  "red-zone": "hotspotRedZone",
};

// The numbers painted on the field, read toward whichever end zone the offense is driving — hence the climb-then-descend back to 10 at midfield.
const YARD_NUMBERS = [10, 20, 30, 40, 50, 40, 30, 20, 10];

// Registered in articleComponents — any Wiki page can drop <FieldDiagram /> into its MDX body with no per-article import.
export function FieldDiagram() {
  const t = useTranslations("fieldDiagram");
  const [active, setActive] = useState<Feature | null>(null);

  function isActive(feature: Feature) {
    return active === feature ? styles.active : undefined;
  }

  return (
    <section className={styles.diagram} aria-label={t("widgetLabel")}>
      <div className={styles.field}>
        <div className={`${styles.endZone} ${styles.endZoneLeft} ${isActive("end-zones") ?? ""}`} />
        <div className={`${styles.endZone} ${styles.endZoneRight} ${isActive("end-zones") ?? ""}`} />
        <div className={`${styles.redZone} ${styles.redZoneLeft} ${isActive("red-zone") ?? ""}`} />
        <div className={`${styles.redZone} ${styles.redZoneRight} ${isActive("red-zone") ?? ""}`} />
        <div className={`${styles.yardLines} ${isActive("yard-lines") ?? ""}`} />
        <div className={`${styles.yardNumbers} ${isActive("yard-lines") ?? ""}`}>
          {YARD_NUMBERS.map((yard, index) => (
            <span key={index}>{yard}</span>
          ))}
        </div>
        <div className={`${styles.hashMarks} ${isActive("hash-marks") ?? ""}`} />
      </div>

      <div className={styles.legend}>
        {FEATURES.map((feature) => (
          <button
            key={feature}
            type="button"
            aria-pressed={active === feature}
            className={active === feature ? styles.legendItemActive : styles.legendItem}
            onClick={() => setActive((prev) => (prev === feature ? null : feature))}
          >
            {t(FEATURE_LABEL_KEYS[feature])}
          </button>
        ))}
      </div>
    </section>
  );
}
