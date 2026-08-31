import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./RelatedArticles.module.scss";

const HEADING_ID = "related-articles-heading";

type RelatedArticlesProps = {
  articles: Article[];
};

export async function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  const t = await getTranslations("relatedArticles");

  return (
    <section className={styles.related} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      <div className={styles.grid}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
