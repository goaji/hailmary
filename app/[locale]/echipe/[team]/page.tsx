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
import { getSchedule } from "@/utils/schedule";
import { SITE_URL } from "@/utils/site";
import {
  buildBreadcrumbJsonLd,
  buildSportsOrganizationJsonLd,
  jsonLdScript,
} from "@/utils/structuredData";
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
    // og:image comes from this route's opengraph-image.tsx (badge on brand1), not the raw logo file.
    openGraph: {
      title: team.name,
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
  const games = getSchedule().games;
  const { previous, next } = getAdjacentTeams(team.slug);

  const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const homeUrl = `${SITE_URL}${getLanguageAlternates("/", [locale])[locale]}`;
  const teamsUrl = `${SITE_URL}${getLanguageAlternates("/echipe", [locale])[locale]}`;
  const teamUrl = `${SITE_URL}${getLanguageAlternates(`/echipe/${team.slug}`, [locale])[locale]}`;

  const sportsOrganizationJsonLd = buildSportsOrganizationJsonLd({
    name: team.name,
    url: teamUrl,
    logoUrl: `${SITE_URL}${team.logoUrl}`,
    league: "NFL",
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tBreadcrumb("home"), url: homeUrl },
    { name: tNav("teams"), url: teamsUrl },
    { name: team.name, url: teamUrl },
  ]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(sportsOrganizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
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
