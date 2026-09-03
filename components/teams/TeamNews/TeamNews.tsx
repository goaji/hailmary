import { getTranslations } from "next-intl/server";
import type { Article } from "@/types";
import { ArticleGrid } from "@/components/articles/ArticleGrid/ArticleGrid";

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
    <ArticleGrid
      headingId={HEADING_ID}
      heading={t("heading")}
      emptyMessage={t("empty", { team: teamName })}
      articles={articles}
      variant="team"
    />
  );
}
