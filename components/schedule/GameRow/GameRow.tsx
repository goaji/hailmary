import { getTranslations } from "next-intl/server";
import type { Game } from "@/types";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import { LiveGameCell } from "@/components/schedule/GameRow/LiveGameCell";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import styles from "./GameRow.module.scss";

type GameRowProps = {
  game: Game;
  locale: string;
};

export async function GameRow({ game, locale }: GameRowProps) {
  const t = await getTranslations({ locale, namespace: "gameRow" });
  const home = getTeam(game.homeTeamId);
  const away = getTeam(game.awayTeamId);
  const hasScore = typeof game.homeScore === "number" && typeof game.awayScore === "number";
  const isLive = game.status === "live" || game.status === "halftime";

  return (
    <tr className={styles.row}>
      <td className={styles.matchup}>
        <TeamBadge team={away} size="sm" />
        <span aria-hidden="true">@</span>
        <TeamBadge team={home} size="sm" />
      </td>
      <td className={styles.kickoff}>{formatKickoff(game.kickoff, locale)}</td>
      <td className={styles.scoreCell}>
        {isLive ? (
          <LiveGameCell
            gameId={game.id}
            initialGame={{
              homeScore: game.homeScore,
              awayScore: game.awayScore,
              quarter: game.quarter,
              clock: game.clock,
              status: game.status,
            }}
          />
        ) : hasScore ? (
          <span className={styles.score}>
            {game.awayScore}–{game.homeScore}
          </span>
        ) : game.status === "postponed" ? (
          <span className={styles.postponed}>{t("postponed")}</span>
        ) : (
          <span>
            <span aria-hidden="true">—</span>
            <span className={styles.visuallyHidden}>{t("notStarted")}</span>
          </span>
        )}
      </td>
    </tr>
  );
}
