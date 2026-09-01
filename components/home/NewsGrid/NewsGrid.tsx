import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import styles from "./NewsGrid.module.scss";

type NewsGridProps = {
  articles: Article[];
};

const HEADING_ID = "news-grid-heading";

export async function NewsGrid({ articles }: NewsGridProps) {
  const t = await getTranslations("newsGrid");

  return (
    <section className={styles.newsGrid} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      {articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} priority={index < 2} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("empty")}</p>
      )}
    </section>
  );
}
