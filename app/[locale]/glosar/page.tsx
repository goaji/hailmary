import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { GlossaryList } from "@/components/reference/GlossaryList/GlossaryList";
import { GlossaryEntryBody } from "@/components/reference/GlossaryEntryBody/GlossaryEntryBody";
import { getAllTerms } from "@/utils/glossary";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/glosar">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "glossary" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      languages: getLanguageAlternates("/glosar"),
    },
  };
}

export default async function GlossaryPage({
  params,
}: PageProps<"/[locale]/glosar">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations("glossary");
  const entries = getAllTerms(locale);

  const items = entries.map((entry) => ({
    slug: entry.slug,
    term: entry.term,
    short: entry.short,
    seeAlso: entry.seeAlso,
    extended: <GlossaryEntryBody key={entry.slug} content={entry.extended} />,
  }));

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>
      <GlossaryList items={items} />
    </div>
  );
}
