import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { ArticleGrid } from "@/components/articles/ArticleGrid/ArticleGrid";
import styles from "./RelatedArticles.module.scss";

type RelatedArticlesProps = {
  articles: Article[];
};

export async function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  const t = await getTranslations("relatedArticles");

  return (
    <div className={styles.relatedArticles}>
      <ArticleGrid headingId="related-articles-heading" heading={t("heading")} articles={articles} />
    </div>
  );
}
