import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import styles from "./NewsGrid.module.scss";

type NewsGridProps = {
  articles: Article[];
};

export async function NewsGrid({ articles }: NewsGridProps) {
  const t = await getTranslations("newsGrid");

  return (
    <div className={styles.newsGrid}>
      <SectionHeading>{t("heading")}</SectionHeading>
      <div className={styles.grid}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
