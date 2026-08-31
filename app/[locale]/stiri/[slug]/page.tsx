import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { Tag } from "@/components/ui/Tag/Tag";
import { Byline } from "@/components/ui/Byline/Byline";
import { getAllArticles, getArticleBySlug, getAvailableLocales } from "@/utils/articles";
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
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image.src }],
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

  return (
    <article className={styles.article}>
      {isFallback ? (
        <p className={styles.fallbackNotice} role="status">
          {t("fallbackNotice")}
        </p>
      ) : null}

      <Tag category={article.category} />
      <h1 className={styles.title}>{article.title}</h1>
      <p className={styles.excerpt}>{article.excerpt}</p>
      <Byline author={article.author} publishedAt={article.publishedAt} />

      {/* Placeholder body — replaced by ArticleHeader (step 2) and the MDX
          component map (step 3). Raw content shown as-is in the meantime. */}
      <pre className={styles.rawContent}>{article.content}</pre>
    </article>
  );
}
