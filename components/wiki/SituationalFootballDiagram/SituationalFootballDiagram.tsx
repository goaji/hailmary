"use client"; // tab selection is local UI state — the widget has no server data of its own

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./SituationalFootballDiagram.module.scss";

const SCENARIO_IDS = ["twoMinute", "fourthDown", "redZone", "clockMgmt", "kneelDown"] as const;
type ScenarioId = (typeof SCENARIO_IDS)[number];

// Field position as a percentage across the strip (0 = own goal line, 100 = opponent goal line).
// Not copy — a layout parameter, so it stays a constant rather than a translation key.
const FIELD_PCT: Record<ScenarioId, number> = {
  twoMinute: 35,
  fourthDown: 45,
  redZone: 92,
  clockMgmt: 50,
  kneelDown: 25,
};

// Registered in articleComponents — any Wiki page can drop <SituationalFootballDiagram /> into its MDX body with no per-article import.
export function SituationalFootballDiagram() {
  const t = useTranslations("situationalFootballDiagram");
  const [activeId, setActiveId] = useState<ScenarioId>(SCENARIO_IDS[0]);
  const panelId = useId();
  const tabId = (id: ScenarioId) => `${panelId}-tab-${id}`;

  return (
    <section className={styles.diagram} aria-label={t("widgetLabel")}>
      <p className={styles.hint}>{t("hint")}</p>

      <div className={styles.pillRow} role="tablist" aria-label={t("widgetLabel")}>
        {SCENARIO_IDS.map((id) => (
          <button
            key={id}
            id={tabId(id)}
            type="button"
            role="tab"
            aria-selected={id === activeId}
            aria-controls={panelId}
            className={styles.pill}
            onClick={() => setActiveId(id)}
          >
            {t(`${id}Pill`)}
          </button>
        ))}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(activeId)} className={styles.dashboard}>
        <p className={styles.chip}>
          {t(`${activeId}DownDistance`)} · {t(`${activeId}Clock`)}
        </p>

        <div className={styles.strip}>
          <div
            className={styles.marker}
            style={{ left: `${FIELD_PCT[activeId]}%` }}
            aria-hidden="true"
          >
            🏈
          </div>
        </div>

        <div className={styles.yardLabels}>
          <span>{t("ownGoalLabel")}</span>
          <span>{t(`${activeId}FieldPosition`)}</span>
          <span>{t("opponentEndZoneLabel")}</span>
        </div>

        <p className={styles.scoreLine}>{t(`${activeId}Score`)}</p>
        <p className={styles.summary}>{t(`${activeId}Summary`)}</p>

        <ul className={styles.changesList}>
          <li>{t(`${activeId}Change1`)}</li>
          <li>{t(`${activeId}Change2`)}</li>
          <li>{t(`${activeId}Change3`)}</li>
        </ul>
      </div>
    </section>
  );
}
