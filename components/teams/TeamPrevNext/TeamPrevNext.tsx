import { getTranslations } from "next-intl/server";
import type { Team } from "@/types";
import { Link } from "@/i18n";
import styles from "./TeamPrevNext.module.scss";

type TeamPrevNextProps = {
  previous?: Team;
  next?: Team;
};

export async function TeamPrevNext({ previous, next }: TeamPrevNextProps) {
  if (!previous && !next) {
    return null;
  }

  const t = await getTranslations("teamDetail.prevNext");

  return (
    <nav aria-label={t("navLabel")} className={styles.nav}>
      {previous ? (
        <Link href={`/echipe/${previous.slug}`} className={styles.previous}>
          <span className={styles.direction}>{t("previous")}</span>
          <span className={styles.name}>{previous.name}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={`/echipe/${next.slug}`} className={styles.next}>
          <span className={styles.direction}>{t("next")}</span>
          <span className={styles.name}>{next.name}</span>
        </Link>
      ) : null}
    </nav>
  );
}
