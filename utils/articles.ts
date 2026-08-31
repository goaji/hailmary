import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import { CATEGORY_IDS } from "@/types";
import type { Article, ArticleFrontmatter, Category, Locale } from "@/types";

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

function articleFilePath(locale: Locale, slug: string): string {
  return path.join(CONTENT_DIR, locale, `${slug}.mdx`);
}

function readArticleFile(locale: Locale, slug: string): Article {
  const filePath = articleFilePath(locale, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseArticleFrontmatter(data, filePath);

  return { ...frontmatter, content, servedLocale: locale };
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

export const getArticleBySlug = cache(
  (slug: string, locale: Locale): Article | undefined => {
    const availableLocales = routing.locales.filter((candidate) =>
      fs.existsSync(articleFilePath(candidate, slug)),
    );
    const servedLocale = resolveServedLocale(locale, availableLocales);

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
