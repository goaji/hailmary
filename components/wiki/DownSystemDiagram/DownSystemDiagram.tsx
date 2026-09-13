"use client"; // simulated plays via local state — the diagram has no server data of its own

import { useTranslations } from "next-intl";
import { useDownSystemState } from "./useDownSystemState";
import styles from "./DownSystemDiagram.module.scss";

const DOWN_KEYS = ["down1", "down2", "down3", "down4"] as const;

// Registered in articleComponents — any Wiki page can drop <DownSystemDiagram /> into its MDX body with no per-article import.
export function DownSystemDiagram() {
  const t = useTranslations("downSystemDiagram");
  const { state, yardsToGo, isFrozen, play, reset } = useDownSystemState();

  const outcomeText =
    state.lastOutcome === "first-down"
      ? t("outcomeFirstDown")
      : state.lastOutcome === "turnover-on-downs"
        ? t("outcomeTurnover")
        : state.lastOutcome === "touchdown"
          ? t("outcomeTouchdown")
          : null;

  return (
    <section className={styles.diagram} aria-label={t("widgetLabel")}>
      <p className={styles.chip}>
        {t("downAndDistance", { down: t(DOWN_KEYS[state.down - 1]), yards: yardsToGo })}
      </p>

      <div className={styles.strip}>
        <div className={styles.progress} style={{ width: `${state.ballOn}%` }} />
        <div className={styles.firstDownLine} style={{ left: `${state.firstDownLine}%` }} />
        <div className={styles.ball} style={{ left: `${state.ballOn}%` }} aria-hidden="true">
          🏈
        </div>
      </div>

      <div className={styles.yardLabels}>
        <span>{t("ownGoalLabel")}</span>
        <span>50</span>
        <span>{t("opponentEndZoneLabel")}</span>
      </div>

      {/* Always mounted (even empty) so a screen reader's live region picks up the change rather than missing a mount-time announcement. */}
      <p className={styles.outcome} role="status">
        {outcomeText}
      </p>

      {isFrozen ? (
        <button type="button" className={styles.resetButton} onClick={reset}>
          {t("resetButton")}
        </button>
      ) : (
        <div className={styles.actions}>
          <button type="button" onClick={() => play(3)}>
            {t("actionGainShort")}
          </button>
          <button type="button" onClick={() => play(7)}>
            {t("actionGainFirstDown")}
          </button>
          <button type="button" onClick={() => play(0)}>
            {t("actionNoGain")}
          </button>
          <button type="button" onClick={() => play(-5)}>
            {t("actionSack")}
          </button>
        </div>
      )}
    </section>
  );
}
