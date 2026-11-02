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
  /** Hides card cover images below md, so the grid reads as a list on phones. */
  hideImagesOnMobile?: boolean;
};

export function ArticleGrid({
  headingId,
  heading,
  emptyMessage,
  articles,
  lang,
  priorityCount = 0,
  hideImagesOnMobile = false,
}: ArticleGridProps) {
  return (
    <section className={styles.articleGrid} aria-labelledby={headingId} lang={lang}>
      <SectionHeading id={headingId}>{heading}</SectionHeading>
      {articles.length > 0 ? (
        <div className={styles.grid} data-hide-image-mobile={hideImagesOnMobile ? "" : undefined}>
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
