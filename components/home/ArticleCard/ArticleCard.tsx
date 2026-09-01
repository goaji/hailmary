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
};

export async function ArticleCard({ article }: ArticleCardProps) {
  const locale = await getLocale();
  // First tagged team only, same "first item is the one shown" convention
  // as the category chip (SKILLS.md) — the payoff for the `teams` field.
  const team = article.teams?.[0] ? getTeam(article.teams[0]) : undefined;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <ArticleImage image={article.image} fill />
      </div>

      <div className={styles.meta}>
        <Tag category={article.category} />
        {team ? <TeamBadge team={team} size="sm" /> : null}
      </div>

      <h3 className={styles.title}>
        <Link href={`/stiri/${article.slug}`} className={styles.titleLink}>
          {article.title}
        </Link>
      </h3>

      <p className={styles.time}>{formatPublishedAt(article.publishedAt, locale)}</p>
    </div>
  );
}
