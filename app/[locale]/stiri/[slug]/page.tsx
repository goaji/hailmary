import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { FallbackNotice } from "@/components/ui/FallbackNotice/FallbackNotice";
import { ArticleHeader } from "@/components/articles/ArticleHeader/ArticleHeader";
import { ArticleBody } from "@/components/articles/ArticleBody/ArticleBody";
import { ArticleTeams } from "@/components/articles/ArticleTeams/ArticleTeams";
import { ArticleRail } from "@/components/articles/ArticleRail/ArticleRail";
import { RelatedArticles } from "@/components/articles/RelatedArticles/RelatedArticles";
import { ArticlePrevNext } from "@/components/articles/ArticlePrevNext/ArticlePrevNext";
import { ScrollProgress } from "@/components/articles/ScrollProgress/ScrollProgress";
import {
  getAllArticles,
  getArticleBySlug,
  getAvailableLocales,
  selectAdjacentArticles,
  selectRecentArticles,
  selectRelatedArticles,
} from "@/utils/articles";
import styles from "./page.module.scss";
import { SITE_URL } from "@/utils/site";
import {
  bcp47Locale,
  buildBreadcrumbJsonLd,
  buildNewsArticleJsonLd,
  jsonLdScript,
} from "@/utils/structuredData";

// Articles are static MDX baked in at build time — generateStaticParams
// already covers every known slug, so this isn't chasing freshness. It's a
// safety net for a slug rendered on demand (e.g. an /en fallback path that
// wasn't statically generated) so it doesn't stay cached indefinitely.
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllArticles(locale).map((article) => ({ locale, slug: article.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/stiri/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const article = getArticleBySlug(slug, locale);
  if (!article) {
    notFound();
  }

  const pathname = `/stiri/${slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: getLanguageAlternates(pathname, [locale])[locale],
      languages: getLanguageAlternates(pathname, getAvailableLocales(slug)),
    },
    // og:image comes from this route's opengraph-image.tsx (title +
    // category + team accent), not the article's own cover photo.
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      authors: [article.author],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/stiri/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const article = getArticleBySlug(slug, locale);
  if (!article) {
    notFound();
  }

  const t = await getTranslations("article");
  const tBreadcrumb = await getTranslations("breadcrumb");
  const isFallback = article.servedLocale !== locale;

  // Sourced from the served locale, not the requested one: news is
  // ro-only, so an /en fallback view still gets ro-fallback siblings
  // rather than an empty related-articles section.
  const siblingArticles = getAllArticles(article.servedLocale);
  const related = selectRelatedArticles(siblingArticles, article);
  const { previous, next } = selectAdjacentArticles(siblingArticles, article.slug);
  // Newest-first; current article always included even if outside the window.
  const recentArticles = selectRecentArticles(siblingArticles, article, 15);

  // Same URL as generateMetadata's own canonical — the fallback view keeps
  // its own /en URL as the entity id, it never aliases to the /ro one.
  const url = `${SITE_URL}${getLanguageAlternates(`/stiri/${slug}`, [locale])[locale]}`;
  const homeUrl = `${SITE_URL}${getLanguageAlternates("/", [locale])[locale]}`;

  const newsArticleJsonLd = buildNewsArticleJsonLd({
    headline: article.title,
    datePublished: article.publishedAt,
    authorName: article.author,
    imageUrl: `${SITE_URL}${article.image.src}`,
    url,
    inLanguage: bcp47Locale(article.servedLocale),
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tBreadcrumb("home"), url: homeUrl },
    { name: article.title, url },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <ScrollProgress />
      <div className={styles.page}>
        <div className={styles.layout}>
          <div className={styles.rail}>
            <ArticleRail articles={recentArticles} currentSlug={article.slug} locale={locale} />
          </div>

          {/* lang matches the served content, not the URL — WCAG 3.1.2 for the /en-serves-ro fallback case. */}
          <article lang={article.servedLocale} className={styles.content}>
            {isFallback ? (
              <FallbackNotice locale={locale}>{t("fallbackNotice")}</FallbackNotice>
            ) : null}

            <ArticleHeader article={article} />
            <ArticleBody content={article.content} tags={article.tags} />
            <ArticleTeams teams={article.teams} />
            <RelatedArticles articles={related} />
            <ArticlePrevNext previous={previous} next={next} />
          </article>
        </div>
      </div>
    </>
  );
}
