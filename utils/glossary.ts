import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import { GLOSSARY_CATEGORY_IDS } from "@/types";
import type { GlossaryEntry, GlossaryEntryFrontmatter, Locale } from "@/types";

const CONTENT_DIR = path.join(process.cwd(), "content", "glossary");

const glossaryFrontmatterSchema = z.object({
  slug: z.string(),
  term: z.string(),
  short: z.string(),
  category: z.enum(GLOSSARY_CATEGORY_IDS),
  relatedTerms: z.array(z.string()).optional(),
  seeAlso: z.string().optional(),
});

/**
 * Validates raw frontmatter data against GlossaryEntryFrontmatter. Throws
 * with the file path and the offending field on failure — never silently
 * falls back to a default, since that would hide a content typo forever.
 */
export function parseGlossaryFrontmatter(
  data: unknown,
  filePath: string,
): GlossaryEntryFrontmatter {
  const result = glossaryFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join(".") || "(root)";
    throw new Error(
      `Invalid frontmatter in ${filePath}: field "${field}" — ${issue.message}`,
    );
  }

  return result.data;
}

export function sortByTerm<T extends { term: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.term.localeCompare(b.term, "ro"));
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

function termFilePath(locale: Locale, slug: string): string {
  return path.join(CONTENT_DIR, locale, `${slug}.mdx`);
}

function readTermFile(locale: Locale, slug: string): GlossaryEntry {
  const filePath = termFilePath(locale, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseGlossaryFrontmatter(data, filePath);

  return { ...frontmatter, extended: content, servedLocale: locale };
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

export const getAllTerms = cache((locale: Locale): GlossaryEntry[] => {
  const entries = listSlugs(locale).map((slug) => readTermFile(locale, slug));
  return sortByTerm(entries);
});

export const getTermBySlug = cache(
  (slug: string, locale: Locale): GlossaryEntry | undefined => {
    const availableLocales = routing.locales.filter((candidate) =>
      fs.existsSync(termFilePath(candidate, slug)),
    );
    const servedLocale = resolveServedLocale(locale, availableLocales);

    return servedLocale ? readTermFile(servedLocale, slug) : undefined;
  },
);

export const getTermSlugs = cache((locale: Locale): string[] => {
  return listSlugs(locale);
});

const TERM_LINK_PATTERN = /<TermLink\b[^>]*\bterm=(["'])(.*?)\1/g;

/** Every slug referenced via `<TermLink term="...">` in raw MDX content. */
export function extractTermLinkSlugs(content: string): string[] {
  return [...content.matchAll(TERM_LINK_PATTERN)].map((match) => match[2]);
}

/**
 * Every <TermLink term="..."> in article content must resolve to a slug in
 * `knownSlugs` — a typo here must fail the build rather than ship as a
 * silently dead trigger. Called at content-read time (utils/articles.ts),
 * with that locale's `getTermSlugs()`, so it runs during
 * generateStaticParams, not on a request.
 */
export function validateTermLinks(
  content: string,
  knownSlugs: string[],
  filePath: string,
): void {
  const known = new Set(knownSlugs);

  for (const slug of extractTermLinkSlugs(content)) {
    if (!known.has(slug)) {
      throw new Error(
        `Unknown glossary term "${slug}" referenced by <TermLink> in ${filePath} — no matching content/glossary entry`,
      );
    }
  }
}
