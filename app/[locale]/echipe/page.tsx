import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { DivisionGroup } from "@/components/teams/DivisionGroup/DivisionGroup";
import { CONFERENCES, DIVISIONS, getTeamsByDivision } from "@/utils/teams";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/echipe">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "teams" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      languages: getLanguageAlternates("/echipe"),
    },
  };
}

export default async function TeamsPage({
  params,
}: PageProps<"/[locale]/echipe">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations("teams");
  const tConference = await getTranslations("conferences");

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>

      {CONFERENCES.map((conference) => {
        const headingId = `conference-${conference}`;

        return (
          <section key={conference} aria-labelledby={headingId} className={styles.conference}>
            <SectionHeading id={headingId}>{tConference(conference)}</SectionHeading>
            {DIVISIONS.map((division) => (
              <DivisionGroup
                key={division}
                conference={conference}
                division={division}
                teams={getTeamsByDivision(conference, division)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
