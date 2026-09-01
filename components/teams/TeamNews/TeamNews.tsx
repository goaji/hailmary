import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import styles from "./TeamNews.module.scss";

const HEADING_ID = "team-news-heading";

type TeamNewsProps = {
  teamName: string;
  articles: Article[];
};

// Zero articles is the common case for most of the 32 teams — an honest
// empty message, never a hidden section or placeholder cards (AGENTS.md).
export async function TeamNews({ teamName, articles }: TeamNewsProps) {
  const t = await getTranslations("teamDetail.news");

  return (
    <section className={styles.news} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      {articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("empty", { team: teamName })}</p>
      )}
    </section>
  );
}
