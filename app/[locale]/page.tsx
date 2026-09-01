import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { OriginStrip } from "@/components/home/OriginStrip/OriginStrip";
import { HeroArticle } from "@/components/home/HeroArticle/HeroArticle";
import { NewsGrid } from "@/components/home/NewsGrid/NewsGrid";
import { Sidebar } from "@/components/home/Sidebar/Sidebar";
import { excludeArticleBySlug, getAllArticles, getFeaturedArticle } from "@/utils/articles";
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

  const featured = getFeaturedArticle(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: featured?.title ?? t("title"),
    description: featured?.excerpt ?? t("description"),
    openGraph: {
      images: featured ? [{ url: featured.image.src }] : [],
    },
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

  // getFeaturedArticle/getAllArticles/getSchedule are synchronous
  // (fs.readFileSync-backed, React-cache-memoized) — there's no real async
  // work to parallelize here, so no Promise.all.
  const featured = getFeaturedArticle(locale);
  const allArticles = getAllArticles(locale);
  const games = selectUpcomingGames(getSchedule().games, SIDEBAR_GAME_COUNT);

  const gridArticles = excludeArticleBySlug(allArticles, featured?.slug).slice(
    0,
    GRID_SIZE,
  );

  return (
    <>
      <OriginStrip />
      {featured ? <HeroArticle article={featured} /> : null}

      <div className={styles.newsSection}>
        <div className={styles.newsGridColumn}>
          <NewsGrid articles={gridArticles} />
        </div>
        <div className={styles.sidebarColumn}>
          <Sidebar games={games} />
        </div>
      </div>
    </>
  );
}
