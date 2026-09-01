import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { ArticleHeader } from "@/components/articles/ArticleHeader/ArticleHeader";
import { ArticleBody } from "@/components/articles/ArticleBody/ArticleBody";
import { ArticleTeams } from "@/components/articles/ArticleTeams/ArticleTeams";
import { RelatedArticles } from "@/components/articles/RelatedArticles/RelatedArticles";
import { ArticlePrevNext } from "@/components/articles/ArticlePrevNext/ArticlePrevNext";
import { ScrollProgress } from "@/components/articles/ScrollProgress/ScrollProgress";
import {
  getAllArticles,
  getArticleBySlug,
  getAvailableLocales,
  selectAdjacentArticles,
  selectRelatedArticles,
} from "@/utils/articles";
import styles from "./page.module.scss";

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

export default async function ArticlePage({
  params,
}: PageProps<"/[locale]/stiri/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const article = getArticleBySlug(slug, locale);
  if (!article) {
    notFound();
  }

  const t = await getTranslations("article");
  const isFallback = article.servedLocale !== locale;

  // Sourced from the served locale, not the requested one: news is
  // ro-only, so an /en fallback view still gets ro-fallback siblings
  // rather than an empty related-articles section.
  const siblingArticles = getAllArticles(article.servedLocale);
  const related = selectRelatedArticles(siblingArticles, article);
  const { previous, next } = selectAdjacentArticles(siblingArticles, article.slug);

  return (
    <>
      <ScrollProgress />
      <article>
        {isFallback ? (
          <p className={styles.fallbackNotice} role="status">
            {t("fallbackNotice")}
          </p>
        ) : null}

        <ArticleHeader article={article} />
        <ArticleBody content={article.content} tags={article.tags} />
        <ArticleTeams teams={article.teams} />
        <RelatedArticles articles={related} />
        <ArticlePrevNext previous={previous} next={next} />
      </article>
    </>
  );
}
