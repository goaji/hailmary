import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { ArticleGrid } from "@/components/articles/ArticleGrid/ArticleGrid";

type NewsGridProps = {
  articles: Article[];
  /** Set when articles are ro-fallback content served under a different locale — see HeroArticle's equivalent use of article.servedLocale. */
  lang?: string;
};

const HEADING_ID = "news-grid-heading";

export async function NewsGrid({ articles, lang }: NewsGridProps) {
  const t = await getTranslations("newsGrid");

  return (
    <ArticleGrid
      headingId={HEADING_ID}
      heading={t("heading")}
      emptyMessage={t("empty")}
      articles={articles}
      lang={lang}
      priorityCount={2}
      variant="news"
    />
  );
}
