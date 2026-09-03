import type { ReactNode } from "react";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import styles from "./ArticleGrid.module.scss";

type ArticleGridProps = {
  headingId: string;
  heading: ReactNode;
  emptyMessage: string;
  articles: Article[];
  /** Set when articles are ro-fallback content served under a different locale — see HeroArticle's equivalent use of article.servedLocale. */
  lang?: string;
  /** Leading cards that render with next/image `priority` — above-the-fold grids only. */
  priorityCount?: number;
  /** "news" caps at 2 columns (homepage); "team" grows to 4 (team page). */
  variant: "news" | "team";
};

export function ArticleGrid({
  headingId,
  heading,
  emptyMessage,
  articles,
  lang,
  priorityCount = 0,
  variant,
}: ArticleGridProps) {
  const sectionClass = variant === "news" ? styles.newsSection : styles.teamSection;
  const gridClass = variant === "news" ? styles.newsGrid : styles.teamGrid;

  return (
    <section className={sectionClass} aria-labelledby={headingId} lang={lang}>
      <SectionHeading id={headingId}>{heading}</SectionHeading>
      {articles.length > 0 ? (
        <div className={gridClass}>
          {articles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} priority={index < priorityCount} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </section>
  );
}
