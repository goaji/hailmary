import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import { getTeam } from "@/utils/teams";
import styles from "./ArticleTeams.module.scss";

type ArticleTeamsProps = {
  teams?: string[];
};

export async function ArticleTeams({ teams }: ArticleTeamsProps) {
  if (!teams || teams.length === 0) {
    return null;
  }

  const t = await getTranslations("articleTeams");

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{t("label")}</span>
      <ul className={styles.list}>
        {teams.map((slug) => {
          const team = getTeam(slug);
          return (
            <li key={slug}>
              <Link href={`/echipe/${team.slug}`} className={styles.link}>
                <TeamBadge team={team} size="sm" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
