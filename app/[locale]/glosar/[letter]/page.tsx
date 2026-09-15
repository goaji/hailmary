import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { GlossaryRail } from "@/components/reference/GlossaryRail/GlossaryRail";
import { GlossaryTerm } from "@/components/reference/GlossaryTerm/GlossaryTerm";
import { TargetRefresh } from "@/components/reference/TargetRefresh/TargetRefresh";
import { ExplainerContent } from "@/components/explainer/ExplainerContent/ExplainerContent";
import { getAllTerms, getGlossaryLetters } from "@/utils/glossary";
import type { Locale } from "@/types";
import styles from "./page.module.scss";

/** Undefined for a letter with no entries, so the caller can 404. */
export function resolveLetter(param: string, locale: Locale): string | undefined {
  const upper = param.toUpperCase();
  return getGlossaryLetters(locale).includes(upper) ? upper : undefined;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getGlossaryLetters(locale).map((letter) => ({ locale, letter: letter.toLowerCase() })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/glosar/[letter]">): Promise<Metadata> {
  const { locale, letter: letterParam } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const letter = resolveLetter(letterParam, locale);
  if (!letter) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "glossary" });
  const path = `/glosar/${letter.toLowerCase()}`;

  return {
    title: t("pageTitle", { letter }),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates(path, [locale])[locale],
      languages: getLanguageAlternates(path),
    },
  };
}

export default async function GlossaryLetterPage({
  params,
}: PageProps<"/[locale]/glosar/[letter]">) {
  const { locale, letter: letterParam } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const letter = resolveLetter(letterParam, locale);
  if (!letter) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "glossary" });
  const entries = getAllTerms(locale);
  const letters = getGlossaryLetters(locale);
  const currentTerms = entries.filter((entry) => entry.term.charAt(0).toUpperCase() === letter);
  const allTerms = entries.map((entry) => ({
    slug: entry.slug,
    term: entry.term,
    letter: entry.term.charAt(0).toUpperCase(),
  }));

  return (
    <div className={styles.page}>
      <TargetRefresh />
      <SectionHeading as="h1">{t("pageTitle", { letter })}</SectionHeading>

      <div className={styles.layout}>
        <div className={styles.rail}>
          <GlossaryRail letters={letters} currentLetter={letter} allTerms={allTerms} />
        </div>

        <div className={styles.content}>
          {currentTerms.map((entry) => (
            <GlossaryTerm
              key={entry.slug}
              entry={entry}
              locale={locale}
              extended={<ExplainerContent content={entry.extended} />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
