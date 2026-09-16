"use client"; // live-updates the schedule table via useLiveScores

import { useTranslations } from "next-intl";
import type { Game } from "@/types";
import {
  ScheduleWeekSwitcher,
  type ScheduleWeek,
} from "@/components/schedule/ScheduleWeekSwitcher/ScheduleWeekSwitcher";
import { ScheduleTable } from "@/components/schedule/ScheduleTable/ScheduleTable";
import { LiveScoreStatus } from "@/components/schedule/LiveScoreStatus/LiveScoreStatus";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { useLiveScores } from "@/components/schedule/useLiveScores";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import { hasLiveGame } from "@/utils/liveGames";
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

export function LiveSchedule({
  locale,
  initialGames,
  initialIsLive,
  initialUpdatedAt,
}: LiveScheduleProps) {
  const t = useTranslations("schedulePage");
  const { data } = useLiveScores(true);
  const games = data?.games ?? initialGames;
  const updatedAt = data?.updatedAt ?? initialUpdatedAt;
  const weeks = getAvailableWeeks(games);
  const defaultWeek = getCurrentWeek(games);

  if (games.length === 0) {
    return (
      <div className={styles.liveSchedule}>
        <SectionHeading as="h1">{t("title")}</SectionHeading>
        <p className={styles.empty}>{t("empty")}</p>
      </div>
    );
  }

  const scheduleWeeks: ScheduleWeek[] = weeks.map((week) => ({
    week,
    label: String(week),
    ariaLabel: t("week", { week }),
    title: t("titleWithWeek", { week }),
    table: (
      <ScheduleTable
        games={games.filter((game) => game.week === week)}
        week={week}
        locale={locale}
      />
    ),
  }));

  return (
    <div className={styles.liveSchedule}>
      <ScheduleWeekSwitcher
        weeks={scheduleWeeks}
        defaultWeek={defaultWeek}
        weekNavLabel={t("weekNavLabel")}
        weeksHeading={t("weeksHeading")}
        liveStatus={
          <LiveScoreStatus initialIsLive={initialIsLive} hasLiveGames={hasLiveGame(games)} />
        }
        updatedAtNote={
          updatedAt && (
            <p className={styles.updatedAt} data-testid="schedule-updated-at">
              {t("updatedAt", { time: formatPublishedAt(updatedAt, locale) })}
            </p>
          )
        }
      />
    </div>
  );
}
