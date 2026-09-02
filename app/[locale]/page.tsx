import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { OriginStrip } from "@/components/home/OriginStrip/OriginStrip";
import { HeroArticle } from "@/components/home/HeroArticle/HeroArticle";
import { NewsGrid } from "@/components/home/NewsGrid/NewsGrid";
import { Sidebar } from "@/components/home/Sidebar/Sidebar";
import { FallbackNotice } from "@/components/ui/FallbackNotice/FallbackNotice";
import { excludeArticleBySlug, getAllArticlesWithFallback, selectFeatured } from "@/utils/articles";
import { getSchedule, selectUpcomingGames } from "@/utils/schedule";
import styles from "./page.module.scss";

const GRID_SIZE = 4;
const SIDEBAR_GAME_COUNT = 3;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const featured = selectFeatured(getAllArticlesWithFallback(locale).articles);
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: featured?.title ?? t("title"),
    description: featured?.excerpt ?? t("description"),
    // og:image comes from opengraph-image.tsx (the site-wide fallback
    // template), not the featured article's own cover photo.
    alternates: {
      canonical: getLanguageAlternates("/", [locale])[locale],
      languages: getLanguageAlternates("/"),
    },
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // getAllArticlesWithFallback/getSchedule are synchronous
  // (fs.readFileSync-backed, React-cache-memoized) — there's no real async
  // work to parallelize here, so no Promise.all.
  const { articles: allArticles, servedLocale } = getAllArticlesWithFallback(locale);
  const isFallback = servedLocale !== locale;
  const featured = selectFeatured(allArticles);
  const games = selectUpcomingGames(getSchedule().games, SIDEBAR_GAME_COUNT);

  const gridArticles = excludeArticleBySlug(allArticles, featured?.slug).slice(
    0,
    GRID_SIZE,
  );

  const t = await getTranslations("newsIndex");

  return (
    <>
      <OriginStrip />
      {isFallback ? <FallbackNotice locale={locale}>{t("fallbackNotice")}</FallbackNotice> : null}
      {featured ? <HeroArticle article={featured} /> : null}

      <div className={styles.newsSection}>
        <div className={styles.newsGridColumn}>
          <NewsGrid articles={gridArticles} lang={isFallback ? servedLocale : undefined} />
        </div>
        <div className={styles.sidebarColumn}>
          <Sidebar games={games} />
        </div>
      </div>
    </>
  );
}
