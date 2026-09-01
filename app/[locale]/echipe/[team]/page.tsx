import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { TeamIdentityBand } from "@/components/teams/TeamIdentityBand/TeamIdentityBand";
import { TeamNews } from "@/components/teams/TeamNews/TeamNews";
import { TeamSchedule } from "@/components/teams/TeamSchedule/TeamSchedule";
import { TeamBlurb } from "@/components/teams/TeamBlurb/TeamBlurb";
import { TeamPrevNext } from "@/components/teams/TeamPrevNext/TeamPrevNext";
import { TEAMS, TEAMS_BY_SLUG, getAdjacentTeams } from "@/utils/teams";
import { getArticlesByTeam } from "@/utils/articles";
import { getScheduleFixture } from "@/utils/schedule";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    TEAMS.map((team) => ({ locale, team: team.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/echipe/[team]">): Promise<Metadata> {
  const { locale, team: teamSlug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const team = TEAMS_BY_SLUG[teamSlug];
  if (!team) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "teamDetail" });
  const pathname = `/echipe/${team.slug}`;

  return {
    title: team.name,
    description: t("metaDescription", { team: team.name }),
    alternates: {
      canonical: getLanguageAlternates(pathname, [locale])[locale],
      languages: getLanguageAlternates(pathname),
    },
    openGraph: {
      title: team.name,
      images: [{ url: team.logoUrl }],
    },
  };
}

export default async function TeamDetailPage({
  params,
}: PageProps<"/[locale]/echipe/[team]">) {
  const { locale, team: teamSlug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const team = TEAMS_BY_SLUG[teamSlug];
  if (!team) {
    notFound();
  }

  const articles = getArticlesByTeam(team.slug, locale);
  const games = getScheduleFixture();
  const { previous, next } = getAdjacentTeams(team.slug);

  return (
    <div className={styles.page}>
      <TeamIdentityBand team={team} />
      <div className={styles.sections}>
        <TeamNews teamName={team.name} articles={articles} />
        <TeamSchedule team={team} games={games} />
        <TeamBlurb />
        <TeamPrevNext previous={previous} next={next} />
      </div>
    </div>
  );
}
