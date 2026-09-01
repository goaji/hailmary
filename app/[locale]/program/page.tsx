import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ScheduleTable } from "@/components/schedule/ScheduleTable/ScheduleTable";
import { ScheduleWeekSwitcher } from "@/components/schedule/ScheduleWeekSwitcher/ScheduleWeekSwitcher";
import { LiveScoreStatus } from "@/components/schedule/LiveScoreStatus/LiveScoreStatus";
import { getAvailableWeeks, getCurrentWeek, getSchedule } from "@/utils/schedule";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import { hasLiveGame } from "@/utils/liveGames";
import styles from "./page.module.scss";

// No searchParams here — reading them server-side forces per-request dynamic
// rendering, which crashes under Hostinger's Node runtime (see DEPLOY.md).
// Every week's table is pre-rendered below; ScheduleWeekSwitcher picks one client-side.
export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  const weekLabels = Object.fromEntries(weeks.map((week) => [week, t("week", { week })]));

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>

      <LiveScoreStatus initialIsLive={isLive} hasLiveGames={hasLiveGame(games)} />

      <ScheduleWeekSwitcher
        weeks={weeks}
        defaultWeek={defaultWeek}
        weekNavLabel={t("weekNavLabel")}
        weekLabels={weekLabels}
        tables={tables}
      />

      {updatedAt && (
        <p className={styles.updatedAt}>
          {t("updatedAt", { time: formatPublishedAt(updatedAt, locale) })}
        </p>
      )}
    </div>
  );
}
