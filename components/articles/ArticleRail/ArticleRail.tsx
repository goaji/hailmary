import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import type { Article, Locale } from "@/types";
import styles from "./ArticleRail.module.scss";

type ArticleRailProps = {
  articles: Array<Pick<Article, "slug" | "title">>;
  currentSlug: string;
  locale: Locale;
};

function ArticleRailList({ articles, currentSlug }: Omit<ArticleRailProps, "locale">) {
  return (
    <ul className={styles.list}>
      {articles.map((article) => {
        const isCurrent = article.slug === currentSlug;

        return (
          <li key={article.slug}>
            {isCurrent ? (
              <span className={styles.linkActive} aria-current="page">
                {article.title}
              </span>
            ) : (
              <Link href={`/stiri/${article.slug}`} className={styles.link}>
                {article.title}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Server Component — a flat, static list needs no client state (unlike WikiRail's accordion).
export async function ArticleRail({ articles, currentSlug, locale }: ArticleRailProps) {
  if (articles.length === 0) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "articleRail" });

  return (
    <div className={styles.articleRail}>
      <nav aria-label={t("label")} className={styles.desktopRail}>
        <h2 className={styles.heading}>{t("heading")}</h2>
        <ArticleRailList articles={articles} currentSlug={currentSlug} />
      </nav>

      <details className={styles.mobileRail}>
        <summary className={styles.summary}>
          {t("mobileLabel")}
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <ArticleRailList articles={articles} currentSlug={currentSlug} />
      </details>
    </div>
  );
}
