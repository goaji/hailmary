import { getTranslations } from "next-intl/server";
import styles from "./LiveScoreBadge.module.scss";

type LiveScoreBadgeProps = {
  quarter?: number;
  clock?: string;
};

// The dot is decorative — "live" is conveyed by the visible "în direct" text, not by color.
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
