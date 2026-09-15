"use client"; // fetches /api/scores client-side so this panel isn't tied to server-rendered/ISR content

import { useLiveScores } from "@/components/schedule/useLiveScores";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { selectUpcomingGames } from "@/utils/games";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import styles from "./UpcomingGamesPanel.module.scss";

type UpcomingGamesPanelProps = {
  locale: string;
  emptyLabel: string;
  count: number;
};

export function UpcomingGamesPanel({ locale, emptyLabel, count }: UpcomingGamesPanelProps) {
  const { data } = useLiveScores(true);
  const games = selectUpcomingGames(data?.games ?? [], count);

  if (games.length === 0) {
    return <p className={styles.empty}>{emptyLabel}</p>;
  }

  return (
    <LinkList
      variant="value"
      items={games.map((game) => ({
        label: `${getTeam(game.awayTeamId).shortName} @ ${getTeam(game.homeTeamId).shortName}`,
        value: formatKickoff(game.kickoff, locale),
      }))}
    />
  );
}
