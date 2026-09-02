import { getLocale } from "next-intl/server";
import type { Article } from "@/types";
import { Link } from "@/i18n";
import { ArticleImage } from "@/components/ui/ArticleImage/ArticleImage";
import { Tag } from "@/components/ui/Tag/Tag";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import { getTeam } from "@/utils/teams";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import styles from "./ArticleCard.module.scss";

type ArticleCardProps = {
  article: Article;
  /** True for the first row of cards, which land above the fold on both the 1-column mobile and 2-column desktop grid. */
  priority?: boolean;
  /**
   * Every existing caller (NewsGrid, TeamNews, RelatedArticles) nests its
   * grid under its own h2 SectionHeading, so "h3" stays the default. A
   * flat archive page with no such intermediate heading (e.g. /stiri)
   * passes "h2" instead, to avoid an h1 → h3 skip that axe's
   * heading-order rule (and real screen-reader users) flag.
   */
  headingLevel?: "h2" | "h3";
};

export async function ArticleCard({ article, priority, headingLevel = "h3" }: ArticleCardProps) {
  const locale = await getLocale();
  // First tagged team only, same "first item is the one shown" convention
  // as the category chip (SKILLS.md) — the payoff for the `teams` field.
  const team = article.teams?.[0] ? getTeam(article.teams[0]) : undefined;
  const Heading = headingLevel;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <ArticleImage
          image={article.image}
          fill
          eager={priority}
          sizes="(min-width: 768px) 33vw, 100vw"
        />
      </div>

      <div className={styles.meta}>
        <Tag category={article.category} />
        {team ? <TeamBadge team={team} size="sm" /> : null}
      </div>

      <Heading className={styles.title}>
        <Link href={`/stiri/${article.slug}`} className={styles.titleLink}>
          {article.title}
        </Link>
      </Heading>

      <p className={styles.time}>{formatPublishedAt(article.publishedAt, locale)}</p>
    </div>
  );
}
