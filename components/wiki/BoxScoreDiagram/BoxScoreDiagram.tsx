"use client"; // click-to-highlight state over a static broadcast mock

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./BoxScoreDiagram.module.scss";

const PLAY_CLOCK_START = 40;

const ELEMENT_IDS = [
  "scoreBug",
  "timeouts",
  "gameClock",
  "downDistance",
  "fieldPosition",
  "playClock",
  "firstDownLine",
] as const;
type ElementId = (typeof ELEMENT_IDS)[number];

const TIMEOUTS_TOTAL = 3;

// Line of scrimmage (ball position) sits close to the first-down target — this mock is 3rd & 4.
const LINE_OF_SCRIMMAGE_PCT = 55;
const FIRST_DOWN_PCT = 62;

// Registered in articleComponents — any Wiki page can drop <BoxScoreDiagram /> into its MDX body with no per-article import.
export function BoxScoreDiagram() {
  const t = useTranslations("boxScoreDiagram");
  const [active, setActive] = useState<ElementId | null>(null);
  const [playClock, setPlayClock] = useState(PLAY_CLOCK_START);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) return;

    const id = setInterval(() => {
      setPlayClock((prev) => (prev <= 0 ? PLAY_CLOCK_START : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function isActive(id: ElementId) {
    return active === id ? styles.regionActive : undefined;
  }

  function toggle(id: ElementId) {
    setActive((prev) => (prev === id ? null : id));
  }

  function timeoutStars(teamCode: string, remaining: number) {
    return (
      <div
        className={`${styles.region} ${styles.timeoutStars} ${isActive("timeouts") ?? ""}`}
        role="img"
        aria-label={t("timeoutsAriaLabel", { team: teamCode, remaining, total: TIMEOUTS_TOTAL })}
      >
        {Array.from({ length: TIMEOUTS_TOTAL }).map((_, i) => (
          <span
            key={i}
            className={i < remaining ? styles.starFilled : styles.starEmpty}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  const awayTeamCode = t("awayTeamCode");
  const awayScore = t("awayScore");
  const awayTimeoutsRemaining = Number(t("awayTimeoutsRemaining"));
  const homeTeamCode = t("homeTeamCode");
  const homeScore = t("homeScore");
  const homeTimeoutsRemaining = Number(t("homeTimeoutsRemaining"));

  return (
    <section className={styles.diagram} aria-label={t("widgetLabel")}>
      <div className={styles.mock}>
        <div className={styles.scoreBug}>
          <div className={styles.teamColumn}>
            <div className={`${styles.region} ${styles.teamRow} ${isActive("scoreBug") ?? ""}`}>
              <span className={styles.teamPill}>{awayTeamCode}</span>
              <span className={styles.score}>{awayScore}</span>
            </div>
            {timeoutStars(awayTeamCode, awayTimeoutsRemaining)}
          </div>

          <span className={styles.dash}>—</span>

          <div className={styles.teamColumn}>
            <div className={`${styles.region} ${styles.teamRow} ${isActive("scoreBug") ?? ""}`}>
              <span className={styles.score}>{homeScore}</span>
              <span className={styles.teamPill}>{homeTeamCode}</span>
            </div>
            {timeoutStars(homeTeamCode, homeTimeoutsRemaining)}
          </div>
        </div>

        <div className={styles.chipRow}>
          <span className={`${styles.region} ${styles.chip} ${isActive("gameClock") ?? ""}`}>
            {t("gameClockValue")}
          </span>
          <span className={`${styles.region} ${styles.chip} ${isActive("downDistance") ?? ""}`}>
            {t("downDistanceValue")}
          </span>
          <span className={`${styles.region} ${styles.chip} ${isActive("fieldPosition") ?? ""}`}>
            {t("fieldPositionValue")}
          </span>
          <span
            className={`${styles.region} ${styles.playClockCircle} ${isActive("playClock") ?? ""}`}
            role="timer"
            aria-label={t("playClockAriaLabel")}
          >
            {playClock}
          </span>
        </div>

        <div className={styles.strip}>
          <div
            className={`${styles.region} ${styles.lineOfScrimmage} ${isActive("fieldPosition") ?? ""}`}
            style={{ left: `${LINE_OF_SCRIMMAGE_PCT}%` }}
          />
          <div
            className={`${styles.region} ${styles.firstDownLine} ${isActive("firstDownLine") ?? ""}`}
            style={{ left: `${FIRST_DOWN_PCT}%` }}
          />
        </div>
      </div>

      <div className={styles.legend}>
        {ELEMENT_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === active}
            className={id === active ? styles.legendItemActive : styles.legendItem}
            onClick={() => toggle(id)}
          >
            {t(`${id}Pill`)}
          </button>
        ))}
      </div>

      {active ? (
        <>
          <h3 className={styles.detailTitle}>{t(`${active}Pill`)}</h3>
          <p className={styles.detailBlurb}>{t(`${active}Blurb`)}</p>
        </>
      ) : (
        <p className={styles.hint}>{t("hint")}</p>
      )}
    </section>
  );
}
