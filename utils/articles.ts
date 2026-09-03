import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import { CATEGORY_IDS } from "@/types";
import type { Article, ArticleFrontmatter, ArticleImage, Category, Locale } from "@/types";
import { contentFilePath, listMdxSlugs, parseFrontmatter, resolveServedLocale } from "@/utils/content";
export { resolveServedLocale } from "@/utils/content";
import { getTermSlugs, validateTermLinks } from "@/utils/glossary";
import { TAG_IDS } from "@/utils/tags";
import { TEAMS_BY_SLUG } from "@/utils/teams";
import roMessages from "@/messages/ro.json";
import enMessages from "@/messages/en.json";

const CONTENT_DIR = path.join(process.cwd(), "content", "articles");

// Used whenever frontmatter omits `image`. Kept to a handful of generic,
// team-agnostic licensed photos rather than one single fallback, so a news
// grid of un-illustrated articles doesn't read as visibly broken.
const DEFAULT_IMAGE_SRCS = [
  "/placeholder/default-floodlights.jpg",
  "/placeholder/default-goalpost.jpg",
  "/placeholder/default-field.jpg",
];

const DEFAULT_IMAGE_ALT: Record<Locale, string> = {
  ro: roMessages.article.defaultImageAlt,
  en: enMessages.article.defaultImageAlt,
};

/**
 * Deterministic pick from `DEFAULT_IMAGE_SRCS`, keyed by slug — the same
 * article always gets the same default (stable across rebuilds/requests)
 * while different articles vary instead of all sharing one image.
 */
export function pickDefaultImage(slug: string, locale: Locale): ArticleImage {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % DEFAULT_IMAGE_SRCS.length;

  return { src: DEFAULT_IMAGE_SRCS[index], alt: DEFAULT_IMAGE_ALT[locale] };
}

const articleFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  category: z.enum(CATEGORY_IDS),
  publishedAt: z.string(),
  author: z.string(),
  image: z
    .object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })
    .optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.enum(TAG_IDS)).optional(),
  kicker: z.string().optional(),
  teams: z.array(z.string()).optional(),
});

export function parseArticleFrontmatter(
  data: unknown,
  filePath: string,
): ArticleFrontmatter {
  return parseFrontmatter(articleFrontmatterSchema, data, filePath);
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
  return contentFilePath(CONTENT_DIR, locale, slug);
}

/** Fails the build if an article's `teams` frontmatter names a slug that isn't a real team — the only place a dangling team reference is caught. */
export function validateTeamSlugs(teams: string[], filePath: string): void {
  for (const slug of teams) {
    if (!(slug in TEAMS_BY_SLUG)) {
      throw new Error(`${filePath}: teams "${slug}" is not a known team slug`);
    }
  }
}

function readArticleFile(locale: Locale, slug: string): Article {
  const filePath = articleFilePath(locale, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseArticleFrontmatter(data, filePath);
  validateTermLinks(content, getTermSlugs(locale), filePath);

  if (frontmatter.teams) {
    validateTeamSlugs(frontmatter.teams, filePath);
  }

  return {
    ...frontmatter,
    image: frontmatter.image ?? pickDefaultImage(frontmatter.slug, locale),
    content,
    servedLocale: locale,
    readingTimeMinutes: estimateReadingTimeMinutes(content),
  };
}

export const getAllArticles = cache((locale: Locale): Article[] => {
  const articles = listMdxSlugs(CONTENT_DIR, locale).map((slug) => readArticleFile(locale, slug));
  return sortByPublishedAtDesc(articles);
});

/**
 * Which locale's article list to actually serve, given how many the
 * requested locale has. Falls back to ro when that count is zero (news
 * is ro-only) — the list-level counterpart to resolveServedLocale's
 * per-article version above.
 */
export function resolveArticlesLocale(requestedLocale: Locale, requestedCount: number): Locale {
  return requestedCount > 0 || requestedLocale === "ro" ? requestedLocale : "ro";
}

/**
 * getAllArticles(locale), falling back to the ro list when the locale has
 * none (news is ro-only). Only for the homepage/stiri index —
 * getArticlesByTeam and plain getAllArticles keep their own honest-empty
 * behavior; a team having no coverage yet is a different, temporary case.
 */
export const getAllArticlesWithFallback = cache(
  (locale: Locale): { articles: Article[]; servedLocale: Locale } => {
    const requested = getAllArticles(locale);
    const servedLocale = resolveArticlesLocale(locale, requested.length);
    return servedLocale === locale
      ? { articles: requested, servedLocale }
      : { articles: getAllArticles(servedLocale), servedLocale };
  },
);

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

export const getArticlesByCategory = cache(
  (category: Category, locale: Locale): Article[] => {
    return getAllArticles(locale).filter((article) => article.category === category);
  },
);

/**
 * Newest-first, up to `limit`. Empty for most of the 32 teams — render an
 * honest empty state, not a hidden section.
 */
export const getArticlesByTeam = cache(
  (teamSlug: string, locale: Locale, limit = 4): Article[] => {
    return getAllArticles(locale)
      .filter((article) => article.teams?.includes(teamSlug))
      .slice(0, limit);
  },
);
