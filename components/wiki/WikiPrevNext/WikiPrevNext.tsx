import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import type { Locale, WikiPrevNext as WikiPrevNextData } from "@/types";
import styles from "./WikiPrevNext.module.scss";

type WikiPrevNextProps = {
  prevNext: WikiPrevNextData;
  locale: Locale;
};

export async function WikiPrevNext({ prevNext, locale }: WikiPrevNextProps) {
  if (!prevNext.prev && !prevNext.next) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "wikiPage" });

  return (
    <nav aria-label={t("readingThreadNavLabel")} className={styles.wikiPrevNext}>
      {prevNext.prev ? (
        <Link
          href={`/wiki/${prevNext.prev.strand}/${prevNext.prev.slug}`}
          className={styles.previous}
        >
          <span className={styles.direction}>{t("prev")}</span>
          <span className={styles.title}>{prevNext.prev.title}</span>
        </Link>
      ) : null}
      {prevNext.next ? (
        <Link href={`/wiki/${prevNext.next.strand}/${prevNext.next.slug}`} className={styles.next}>
          <span className={styles.direction}>{t("next")}</span>
          <span className={styles.title}>{prevNext.next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
