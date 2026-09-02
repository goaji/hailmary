import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import { getAllArticles } from "@/utils/articles";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/stiri">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "newsIndex" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates("/stiri", [locale])[locale],
      languages: getLanguageAlternates("/stiri"),
    },
  };
}

export default async function NewsIndexPage({
  params,
}: PageProps<"/[locale]/stiri">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // News is Romanian-only (AGENTS.md) — getAllArticles(locale) reads
  // content/articles/<locale>, which has no "en" files, so this is
  // legitimately empty under /en rather than falling back to the ro list.
  // Same honest-empty-state contract as TeamNews, not a silent language
  // switch.
  const articles = getAllArticles(locale);
  const t = await getTranslations("newsIndex");

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>

      {articles.length > 0 ? (
        <div className={styles.grid}>
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              priority={index < 3}
              headingLevel="h2"
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("empty")}</p>
      )}
    </div>
  );
}
