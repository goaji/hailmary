import { getTranslations } from "next-intl/server";
import styles from "./LiveScoreBadge.module.scss";

type LiveScoreBadgeProps = {
  quarter?: number;
  clock?: string;
};

// The dot is decorative only — "live" state is conveyed by the visible
// "în direct" text itself, not by color, so it reads correctly with CSS
// off or on a screen reader.
export async function LiveScoreBadge({ quarter, clock }: LiveScoreBadgeProps) {
  const t = await getTranslations("liveScoreBadge");

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
