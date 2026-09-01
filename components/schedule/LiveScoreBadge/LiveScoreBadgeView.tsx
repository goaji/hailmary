import styles from "./LiveScoreBadge.module.scss";

type LiveScoreBadgeViewProps = {
  quarter?: number;
  clock?: string;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
};

// Presentational only — no server- or client-only imports, so both the
// server-rendered LiveScoreBadge and the client-side polling cell can
// share this without crossing the server/client translation-hook boundary.
export function LiveScoreBadgeView({ quarter, clock, t }: LiveScoreBadgeViewProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{t("live")}</span>
      {quarter !== undefined && clock !== undefined && (
        <span className={styles.detail}>{t("quarterClock", { quarter, clock })}</span>
      )}
    </span>
  );
}
