import type { ReactNode } from "react";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import styles from "./ArticleGrid.module.scss";

type ArticleGridProps = {
  headingId: string;
  heading: ReactNode;
  /** Omitted by callers that render nothing at all when there are no articles. */
  emptyMessage?: string;
  articles: Article[];
  /** Set when articles are ro-fallback content served under a different locale — see HeroArticle's equivalent use of article.servedLocale. */
  lang?: string;
  /** Leading cards that render with next/image `priority` — above-the-fold grids only. */
  priorityCount?: number;
};

export function ArticleGrid({
  headingId,
  heading,
  emptyMessage,
  articles,
  lang,
  priorityCount = 0,
}: ArticleGridProps) {
  return (
    <section className={styles.articleGrid} aria-labelledby={headingId} lang={lang}>
      <SectionHeading id={headingId}>{heading}</SectionHeading>
      {articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} priority={index < priorityCount} />
          ))}
        </div>
      ) : emptyMessage ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : null}
    </section>
  );
}
