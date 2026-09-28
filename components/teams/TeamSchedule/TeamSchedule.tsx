import { getLocale, getTranslations } from "next-intl/server";
import type { Game, Team } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ScheduleTable } from "@/components/schedule/ScheduleTable/ScheduleTable";
import { LiveScoreStatus } from "@/components/schedule/LiveScoreStatus/LiveScoreStatus";
import { hasLiveGame } from "@/utils/liveGames";
import styles from "./TeamSchedule.module.scss";

const HEADING_ID = "team-schedule-heading";

type TeamScheduleProps = {
  team: Team;
  games: Game[];
  /** Whether the schedule store has synced real data. */
  isLive: boolean;
};

// Most teams have zero games until the schedule store syncs — same honest-empty-state contract as the team news grid.
export async function TeamSchedule({ team, games, isLive }: TeamScheduleProps) {
  const locale = await getLocale();
  const t = await getTranslations("teamDetail.schedule");

  const teamGames = games
    .filter((game) => game.homeTeamId === team.slug || game.awayTeamId === team.slug)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  return (
    <section className={styles.teamSchedule} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      {teamGames.length > 0 ? (
        <>
          <LiveScoreStatus initialIsLive={isLive} hasLiveGames={hasLiveGame(teamGames)} />
          <ScheduleTable games={teamGames} caption={t("caption", { team: team.name })} locale={locale} />
        </>
      ) : (
        <p className={styles.empty}>{t("empty", { team: team.name })}</p>
      )}
    </section>
  );
}
