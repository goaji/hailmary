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
import { getAvailableWeeks, getCurrentWeek } from "@/utils/scheduleWeeks";
import styles from "./LiveSchedule.module.scss";

type LiveScheduleProps = {
  locale: string;
  initialGames: Game[];
  initialIsLive: boolean;
  initialUpdatedAt: string | null;
};

export function LiveSchedule({
  locale,
  initialGames,
  initialIsLive,
  initialUpdatedAt,
}: LiveScheduleProps) {
  const t = useTranslations("schedulePage");
  const tTable = useTranslations("scheduleTable");
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
        caption={tTable("caption", { week })}
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
