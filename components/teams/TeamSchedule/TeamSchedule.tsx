import { getLocale, getTranslations } from "next-intl/server";
import type { Game, Team } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import styles from "./TeamSchedule.module.scss";

const HEADING_ID = "team-schedule-heading";

type TeamScheduleProps = {
  team: Team;
  games: Game[];
};

// The fixture only covers a handful of teams (task 4's placeholder data,
// not a live feed) — most of the 32 will have zero games here too, same
// honest-empty-state contract as TeamNews.
export async function TeamSchedule({ team, games }: TeamScheduleProps) {
  const locale = await getLocale();
  const t = await getTranslations("teamDetail.schedule");

  const teamGames = games
    .filter((game) => game.homeTeamId === team.slug || game.awayTeamId === team.slug)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  return (
    <section className={styles.schedule} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      {teamGames.length > 0 ? (
        <LinkList
          variant="value"
          items={teamGames.map((game) => {
            const isHome = game.homeTeamId === team.slug;
            const opponent = getTeam(isHome ? game.awayTeamId : game.homeTeamId);

            return {
              label: `${isHome ? "vs" : "@"} ${opponent.shortName}`,
              value: formatKickoff(game.kickoff, locale),
            };
          })}
        />
      ) : (
        <p className={styles.empty}>{t("empty", { team: team.name })}</p>
      )}
    </section>
  );
}
