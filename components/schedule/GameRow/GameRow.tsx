import { useTranslations } from "next-intl";
import type { Game } from "@/types";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import { LiveScoreBadgeView } from "@/components/schedule/LiveScoreBadge/LiveScoreBadgeView";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import { hasGameScore, isLiveStatus } from "@/utils/liveGames";
import styles from "./GameRow.module.scss";

type GameRowProps = {
  game: Game;
  locale: string;
};

export function GameRow({ game, locale }: GameRowProps) {
  const t = useTranslations("gameRow");
  const liveT = useTranslations("liveScoreBadge");
  const home = getTeam(game.homeTeamId);
  const away = getTeam(game.awayTeamId);
  const hasScore = hasGameScore(game);
  const isLive = isLiveStatus(game.status);

  return (
    <tr className={styles.gameRow}>
      <td className={styles.matchup}>
        <TeamBadge team={away} size="sm" />
        <span aria-hidden="true" className={styles.separator}>
          @
        </span>
        <TeamBadge team={home} size="sm" />
      </td>
      <td className={styles.kickoff}>{formatKickoff(game.kickoff, locale)}</td>
      <td className={styles.scoreCell}>
        {hasScore ? (
          <span className={styles.score} role={isLive ? undefined : "status"}>
            {game.awayScore}–{game.homeScore}
          </span>
        ) : game.status === "postponed" ? (
          <span className={styles.postponed}>{t("postponed")}</span>
        ) : !isLive ? (
          <span>
            <span aria-hidden="true">—</span>
            <span className={styles.visuallyHidden}>{t("notStarted")}</span>
          </span>
        ) : null}
        {isLive && <LiveScoreBadgeView quarter={game.quarter} clock={game.clock} t={liveT} />}
      </td>
    </tr>
  );
}
