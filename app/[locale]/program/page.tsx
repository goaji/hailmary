import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { getSchedule } from "@/utils/schedule";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import styles from "./page.module.scss";

// Deliberately minimal: this is the degraded/empty-store path (task step 2).
// Step 3 replaces the list below with a real ScheduleTable/GameRow/
// LiveScoreBadge build-out and a week selector; the data plumbing
// (getSchedule, the notice copy) stays the same.

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
      languages: getLanguageAlternates("/program"),
    },
  };
}

export default async function SchedulePage({
  params,
}: PageProps<"/[locale]/program">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations("schedulePage");
  const { games, isLive } = getSchedule();

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>

      {!isLive && <p className={styles.notice}>{t("liveUnavailableNotice")}</p>}

      <ul className={styles.list}>
        {games.map((game) => {
          const home = getTeam(game.homeTeamId);
          const away = getTeam(game.awayTeamId);

          return (
            <li key={game.id} className={styles.row}>
              <span>
                {away.shortName} @ {home.shortName}
              </span>
              <span className={styles.kickoff}>{formatKickoff(game.kickoff, locale)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
