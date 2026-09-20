import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import { NewsFilters } from "@/components/articles/NewsFilters/NewsFilters";
import { FallbackNotice } from "@/components/ui/FallbackNotice/FallbackNotice";
import { getAllArticlesWithFallback } from "@/utils/articles";
import { requireLocale } from "@/utils/locale";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/stiri">): Promise<Metadata> {
  const locale = requireLocale((await params).locale);

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

export default async function NewsIndexPage({ params }: PageProps<"/[locale]/stiri">) {
  const locale = requireLocale((await params).locale);

  // News is Romanian-only — getAllArticlesWithFallback falls back to the
  // ro list under /en (with a notice below), the same ro-fallback contract
  // as an individual article page rather than a silent language switch.
  const { articles, servedLocale } = getAllArticlesWithFallback(locale);
  const isFallback = servedLocale !== locale;
  const t = await getTranslations("newsIndex");

  const items = articles.map((article, index) => ({
    slug: article.slug,
    category: article.category,
    teams: article.teams,
    node: (
      <ArticleCard key={article.slug} article={article} priority={index < 3} headingLevel="h2" />
    ),
  }));

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>
      {isFallback ? <FallbackNotice locale={locale}>{t("fallbackNotice")}</FallbackNotice> : null}

      {articles.length > 0 ? (
        <NewsFilters items={items} lang={isFallback ? servedLocale : undefined} />
      ) : (
        <p className={styles.empty}>{t("empty")}</p>
      )}
    </div>
  );
}
