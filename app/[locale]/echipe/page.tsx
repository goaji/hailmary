import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { DivisionGroup } from "@/components/teams/DivisionGroup/DivisionGroup";
import { CONFERENCES, DIVISIONS, getTeamsByDivision } from "@/utils/teams";
import { requireLocale } from "@/utils/locale";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/echipe">): Promise<Metadata> {
  const locale = requireLocale((await params).locale);

  const t = await getTranslations({ locale, namespace: "teams" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates("/echipe", [locale])[locale],
      languages: getLanguageAlternates("/echipe"),
    },
  };
}

export default async function TeamsPage({ params }: PageProps<"/[locale]/echipe">) {
  requireLocale((await params).locale);

  const t = await getTranslations("teams");

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>

      {/* Conference names are proper nouns ("AFC"/"NFC"), not translated —
          same treatment as team names, per AGENTS.md. */}
      {CONFERENCES.map((conference) => {
        const headingId = `conference-${conference}`;

        return (
          <section key={conference} aria-labelledby={headingId} className={styles.conference}>
            <SectionHeading id={headingId}>{conference}</SectionHeading>
            {DIVISIONS.map((division) => (
              <DivisionGroup
                key={division}
                conference={conference}
                division={division}
                teams={getTeamsByDivision(conference, division)}
                conferenceHeadingId={headingId}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
