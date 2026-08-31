import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import { CATEGORY_IDS } from "@/types";
import type { Article, ArticleFrontmatter, Category, Locale } from "@/types";
import { getTermSlugs, validateTermLinks } from "@/utils/glossary";

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

const articleFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  category: z.enum(CATEGORY_IDS),
  publishedAt: z.string(),
  author: z.string(),
  image: z.object({
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  kicker: z.string().optional(),
});

/**
 * Validates raw frontmatter data against ArticleFrontmatter. Throws with
 * the file path and the offending field on failure — never silently
 * falls back to a default, since that would hide a content typo forever.
 */
export function parseArticleFrontmatter(
  data: unknown,
  filePath: string,
): ArticleFrontmatter {
  const result = articleFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join(".") || "(root)";
    throw new Error(
      `Invalid frontmatter in ${filePath}: field "${field}" — ${issue.message}`,
    );
  }

  return result.data;
}

export function sortByPublishedAtDesc<T extends { publishedAt: string }>(
  articles: T[],
): T[] {
  return [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/**
 * Newest featured article, falling back to the newest overall so the
 * homepage hero is never empty — as long as `sortedArticles` isn't empty.
 * `sortedArticles` must already be newest-first (see sortByPublishedAtDesc).
 */
export function selectFeatured<T extends { featured?: boolean }>(
  sortedArticles: T[],
): T | undefined {
  return sortedArticles.find((article) => article.featured) ?? sortedArticles[0];
}

/**
 * Removes an article by slug (e.g. the featured one) from a list, so the
 * homepage grid doesn't repeat the article already shown in the hero.
 * A no-op when `slug` is undefined, so callers don't need to branch on
 * whether a featured article exists.
 */
export function excludeArticleBySlug<T extends { slug: string }>(
  articles: T[],
  slug: string | undefined,
): T[] {
  if (!slug) {
    return articles;
  }
  return articles.filter((article) => article.slug !== slug);
}

/**
 * Up to `limit` related articles for `current`: same-category first
 * (newest first), topped up with the newest articles overall rather than
 * rendering a short row when fewer than `limit` share the category.
 * `articles` must already be newest-first (see sortByPublishedAtDesc) and
 * may include `current` itself — it's excluded either way.
 */
export function selectRelatedArticles<
  T extends { slug: string; category: string },
>(articles: T[], current: T, limit = 3): T[] {
  const others = articles.filter((article) => article.slug !== current.slug);
  const sameCategory = others.filter((article) => article.category === current.category);
  const rest = others.filter((article) => article.category !== current.category);

  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * The chronological neighbours of `currentSlug` — older (`previous`) and
 * newer (`next`) — for a prev/next footer nav. `sortedArticles` must
 * already be newest-first; either side is `undefined` at either end of
 * the list, which the caller renders as absent, not a disabled stub.
 */
export function selectAdjacentArticles<T extends { slug: string }>(
  sortedArticles: T[],
  currentSlug: string,
): { previous?: T; next?: T } {
  const index = sortedArticles.findIndex((article) => article.slug === currentSlug);

  if (index === -1) {
    return {};
  }

  return {
    next: sortedArticles[index - 1],
    previous: sortedArticles[index + 1],
  };
}

/**
 * Which locale to actually serve for a request, given which locales have
 * a translation on disk. Falls back to `ro`, per the i18n scope in
 * AGENTS.md — the caller decides whether to show a fallback notice, this
 * function only decides what content to load.
 */
export function resolveServedLocale(
  requestedLocale: Locale,
  availableLocales: Locale[],
): Locale | undefined {
  if (availableLocales.includes(requestedLocale)) {
    return requestedLocale;
  }
  if (availableLocales.includes("ro")) {
    return "ro";
  }
  return undefined;
}

/**
 * Reading time from MDX body word count at ~200 wpm (a reasonable rate for
 * Romanian). Strips the markdown syntax that would otherwise inflate the
 * count as if it were prose — code, images, link targets (keeping link
 * text), heading/quote/list markers, and table pipes — without touching
 * mid-word characters like hyphens, so compound words aren't split.
 * Always at least 1 minute, even for a very short article.
 */
export function estimateReadingTimeMinutes(content: string, wordsPerMinute = 200): number {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\|/g, " ");

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

function articleFilePath(locale: Locale, slug: string): string {
  return path.join(CONTENT_DIR, locale, `${slug}.mdx`);
}

function readArticleFile(locale: Locale, slug: string): Article {
  const filePath = articleFilePath(locale, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseArticleFrontmatter(data, filePath);
  validateTermLinks(content, getTermSlugs(locale), filePath);

  return {
    ...frontmatter,
    content,
    servedLocale: locale,
    readingTimeMinutes: estimateReadingTimeMinutes(content),
  };
}

function listSlugs(locale: Locale): string[] {
  const dir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export const getAllArticles = cache((locale: Locale): Article[] => {
  const articles = listSlugs(locale).map((slug) => readArticleFile(locale, slug));
  return sortByPublishedAtDesc(articles);
});

/**
 * Which locales have a real, dedicated translation file for this slug —
 * not which locales the article *serves* (every slug with a `ro` file
 * serves every locale, via fallback). Used for `alternates.languages`:
 * an hreflang entry should only point at genuinely distinct content, not
 * duplicate the `ro` fallback under an `en` URL.
 */
export const getAvailableLocales = cache((slug: string): Locale[] => {
  return routing.locales.filter((candidate) =>
    fs.existsSync(articleFilePath(candidate, slug)),
  );
});

export const getArticleBySlug = cache(
  (slug: string, locale: Locale): Article | undefined => {
    const servedLocale = resolveServedLocale(locale, getAvailableLocales(slug));

    return servedLocale ? readArticleFile(servedLocale, slug) : undefined;
  },
);

export const getFeaturedArticle = cache((locale: Locale): Article | undefined => {
  return selectFeatured(getAllArticles(locale));
});

export const getArticlesByCategory = cache(
  (category: Category, locale: Locale): Article[] => {
    return getAllArticles(locale).filter((article) => article.category === category);
  },
);
