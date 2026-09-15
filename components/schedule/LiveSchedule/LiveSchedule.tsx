"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Game } from "@/types";
import { ScheduleWeekSwitcher } from "@/components/schedule/ScheduleWeekSwitcher/ScheduleWeekSwitcher";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import { LiveScoreBadgeView } from "@/components/schedule/LiveScoreBadge/LiveScoreBadgeView";
import { useLiveScores } from "@/components/schedule/useLiveScores";
import { formatKickoff } from "@/utils/formatKickoff";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import { getTeam } from "@/utils/teams";
import { hasGameScore, isLiveStatus } from "@/utils/liveGames";
import tableStyles from "@/components/schedule/ScheduleTable/ScheduleTable.module.scss";
import rowStyles from "@/components/schedule/GameRow/GameRow.module.scss";
import styles from "./LiveSchedule.module.scss";

type LiveScheduleProps = {
    locale: string;
    initialGames: Game[];
    initialIsLive: boolean;
    initialUpdatedAt: string | null;
};

function getAvailableWeeks(games: Game[]): number[] {
    return Array.from(new Set(games.map((game) => game.week))).sort((a, b) => a - b);
}

function getCurrentWeek(games: Game[]): number {
    if (games.length === 0) {
        return 1;
    }
    const unresolved = games.filter((game) => game.status !== "final");
    return unresolved.length > 0
        ? Math.min(...unresolved.map((game) => game.week))
        : Math.max(...games.map((game) => game.week));
}

function GameRow({ game, locale }: { game: Game; locale: string }) {
    const t = useTranslations("gameRow");
    const liveT = useTranslations("liveScoreBadge");
    const home = getTeam(game.homeTeamId);
    const away = getTeam(game.awayTeamId);
    const hasScore = hasGameScore(game);
    const isLive = isLiveStatus(game.status);

    return (
        <tr className={rowStyles.row}>
            <td className={rowStyles.matchup}>
                <TeamBadge team={away} size="sm" />
                <span aria-hidden="true" className={rowStyles.separator}>@</span>
                <TeamBadge team={home} size="sm" />
            </td>
            <td className={rowStyles.kickoff}>{formatKickoff(game.kickoff, locale)}</td>
            <td className={rowStyles.scoreCell}>
                {isLive && <LiveScoreBadgeView quarter={game.quarter} clock={game.clock} t={liveT} />}
                {hasScore ? (
                    <span className={rowStyles.score} role={isLive ? undefined : "status"}>
                        {game.awayScore}–{game.homeScore}
                    </span>
                ) : game.status === "postponed" ? (
                    <span className={rowStyles.postponed}>{t("postponed")}</span>
                ) : !isLive ? (
                    <span>
                        <span aria-hidden="true">—</span>
                        <span className={rowStyles.visuallyHidden}>{t("notStarted")}</span>
                    </span>
                ) : null}
            </td>
        </tr>
    );
}

function ScheduleTable({ games, week, locale }: { games: Game[]; week: number; locale: string }) {
    const t = useTranslations("scheduleTable");

    return (
        <div role="region" aria-label={t("scrollLabel")} tabIndex={0} className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
                <caption className={tableStyles.caption}>{t("caption", { week })}</caption>
                <thead>
                    <tr>
                        <th scope="col">{t("matchup")}</th>
                        <th scope="col">{t("kickoff")}</th>
                        <th scope="col">{t("score")}</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => <GameRow key={game.id} game={game} locale={locale} />)}
                </tbody>
            </table>
        </div>
    );
}

export function LiveSchedule({ locale, initialGames, initialIsLive, initialUpdatedAt }: LiveScheduleProps) {
    const t = useTranslations("schedulePage");
    const { data } = useLiveScores(true);
    const games = data?.games ?? initialGames;
    const isLive = data?.isLive ?? initialIsLive;
    const updatedAt = data?.updatedAt ?? initialUpdatedAt;
    const weeks = getAvailableWeeks(games);
    const defaultWeek = getCurrentWeek(games);

    if (games.length === 0) {
        return <p className={styles.empty}>{t("empty")}</p>;
    }

    const tables: Record<number, ReactNode> = Object.fromEntries(
        weeks.map((week) => [
            week,
            <ScheduleTable key={week} games={games.filter((game) => game.week === week)} week={week} locale={locale} />,
        ]),
    );
    const weekLabels = Object.fromEntries(weeks.map((week) => [week, String(week)]));
    const weekAriaLabels = Object.fromEntries(weeks.map((week) => [week, t("week", { week })]));
    const titleLabels = Object.fromEntries(weeks.map((week) => [week, t("titleWithWeek", { week })]));

    return (
        <ScheduleWeekSwitcher
            weeks={weeks}
            defaultWeek={defaultWeek}
            weekNavLabel={t("weekNavLabel")}
            weeksHeading={t("weeksHeading")}
            weekLabels={weekLabels}
            weekAriaLabels={weekAriaLabels}
            titleLabels={titleLabels}
            tables={tables}
            liveStatus={isLive ? null : undefined}
            updatedAtNote={
                updatedAt && (
                    <p className={styles.updatedAt}>
                        {t("updatedAt", { time: formatPublishedAt(updatedAt, locale) })}
                    </p>
                )
            }
        />
    );
}