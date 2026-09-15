import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { ScheduleTable } from "@/components/schedule/ScheduleTable/ScheduleTable";
import { ScheduleWeekSwitcher } from "@/components/schedule/ScheduleWeekSwitcher/ScheduleWeekSwitcher";
import { LiveScoreStatus } from "@/components/schedule/LiveScoreStatus/LiveScoreStatus";
import { getAvailableWeeks, getCurrentWeek, getSchedule } from "@/utils/schedule";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import { hasLiveGame } from "@/utils/liveGames";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./page.module.scss";

// Rendered fresh on every request — static+ISR left this page stuck serving
// build-time (empty) content indefinitely on this host, since regeneration
// never reliably landed. getSchedule() is a cheap local file read, so
// per-request rendering costs nothing meaningful here.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/program">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "schedulePage" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates("/program", [locale])[locale],
      languages: getLanguageAlternates("/program"),
    },
  };
}

export default async function SchedulePage({ params }: PageProps<"/[locale]/program">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "schedulePage" });
  const { games, isLive, updatedAt } = getSchedule();

  const weeks = getAvailableWeeks(games);
  const defaultWeek = getCurrentWeek(games);

  const tables = Object.fromEntries(
    weeks.map((week) => [
      week,
      <ScheduleTable
        key={week}
        games={games.filter((game) => game.week === week)}
        week={week}
        locale={locale}
      />,
    ]),
  );
  // Full "Săptămâna N" phrasing moves to aria-label; the visible link is just the number.
  const weekLabels = Object.fromEntries(weeks.map((week) => [week, String(week)]));
  const weekAriaLabels = Object.fromEntries(weeks.map((week) => [week, t("week", { week })]));
  // Per-week so the h1 (rendered client-side) can track whichever week is selected.
  const titleLabels = Object.fromEntries(weeks.map((week) => [week, t("titleWithWeek", { week })]));

  return (
    <div className={styles.page}>
      {games.length > 0 ? (
        <ScheduleWeekSwitcher
          weeks={weeks}
          defaultWeek={defaultWeek}
          weekNavLabel={t("weekNavLabel")}
          weeksHeading={t("weeksHeading")}
          weekLabels={weekLabels}
          weekAriaLabels={weekAriaLabels}
          titleLabels={titleLabels}
          tables={tables}
          liveStatus={<LiveScoreStatus initialIsLive={isLive} hasLiveGames={hasLiveGame(games)} />}
          updatedAtNote={
            updatedAt && (
              <p className={styles.updatedAt}>
                {t("updatedAt", { time: formatPublishedAt(updatedAt, locale) })}
              </p>
            )
          }
        />
      ) : (
        <>
          <SectionHeading as="h1">{t("title")}</SectionHeading>
          <p className={styles.empty}>{t("empty")}</p>
        </>
      )}
    </div>
  );
}
