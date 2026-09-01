"use client";

import { useTranslations } from "next-intl";
import type { Game } from "@/types";
import { LiveScoreBadgeView } from "@/components/schedule/LiveScoreBadge/LiveScoreBadgeView";
import { useLiveScores } from "@/components/schedule/useLiveScores";
import styles from "./GameRow.module.scss";

type LiveGameCellProps = {
  gameId: string;
  initialGame: Pick<Game, "homeScore" | "awayScore" | "quarter" | "clock" | "status">;
};

// The live-specific slice of GameRow's score cell — client-only so it can
// poll. First render uses initialGame (identical to the server-rendered
// output) until a poll resolves, so there's no hydration mismatch.
export function LiveGameCell({ gameId, initialGame }: LiveGameCellProps) {
  const t = useTranslations("liveScoreBadge");
  const { data } = useLiveScores(true);
  const current = data?.games.find((game) => game.id === gameId) ?? initialGame;
  const hasScore = typeof current.homeScore === "number" && typeof current.awayScore === "number";
  const isLive = current.status === "live" || current.status === "halftime";

  return (
    <>
      {hasScore && (
        <span className={styles.score}>
          {current.awayScore}–{current.homeScore}
        </span>
      )}
      {isLive && <LiveScoreBadgeView quarter={current.quarter} clock={current.clock} t={t} />}
    </>
  );
}
