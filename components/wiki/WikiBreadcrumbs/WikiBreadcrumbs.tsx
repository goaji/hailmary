import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import type { Locale, WikiStrandId } from "@/types";
import styles from "./WikiBreadcrumbs.module.scss";

type WikiBreadcrumbsProps = {
  strand: WikiStrandId;
  pageTitle: string;
  locale: Locale;
};

// The strand crumb is plain text, not a link — there's no strand-landing route to point it at.
export async function WikiBreadcrumbs({ strand, pageTitle, locale }: WikiBreadcrumbsProps) {
  const t = await getTranslations({ locale, namespace: "wikiPage" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tStrands = await getTranslations({ locale, namespace: "wikiStrands" });

  return (
    <nav aria-label={t("breadcrumbNavLabel")} className={styles.wikiBreadcrumbs}>
      <ol className={styles.list}>
        <li>
          <Link href="/wiki" className={styles.link}>
            {tNav("wiki")}
          </Link>
        </li>
        <li className={styles.strand}>{tStrands(`${strand}.name`)}</li>
        <li className={styles.current} aria-current="page">
          {pageTitle}
        </li>
      </ol>
    </nav>
  );
}
