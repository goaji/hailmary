import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { Link } from "@/i18n";
import styles from "./ArticlePrevNext.module.scss";

type ArticlePrevNextProps = {
  previous?: Article;
  next?: Article;
};

export async function ArticlePrevNext({ previous, next }: ArticlePrevNextProps) {
  if (!previous && !next) {
    return null;
  }

  const t = await getTranslations("articlePrevNext");

  return (
    <nav aria-label={t("navLabel")} className={styles.nav}>
      {previous ? (
        <Link href={`/stiri/${previous.slug}`} className={styles.previous}>
          <span className={styles.direction}>{t("previous")}</span>
          <span className={styles.title}>{previous.title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={`/stiri/${next.slug}`} className={styles.next}>
          <span className={styles.direction}>{t("next")}</span>
          <span className={styles.title}>{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
