import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import { GLOSSARY_CATEGORY_IDS } from "@/types";
import type { GlossaryEntry, GlossaryEntryFrontmatter, Locale } from "@/types";
import { contentFilePath, listMdxSlugs, parseFrontmatter, resolveServedLocale } from "@/utils/content";
import { validateSeeAlso } from "@/utils/reference";

export { resolveServedLocale } from "@/utils/content";

const CONTENT_DIR = path.join(process.cwd(), "content", "glossary");

const glossaryFrontmatterSchema = z.object({
  slug: z.string(),
  term: z.string(),
  short: z.string(),
  category: z.enum(GLOSSARY_CATEGORY_IDS),
  relatedTerms: z.array(z.string()).optional(),
  seeAlso: z.string().optional(),
});

export function parseGlossaryFrontmatter(
  data: unknown,
  filePath: string,
): GlossaryEntryFrontmatter {
  return parseFrontmatter(glossaryFrontmatterSchema, data, filePath);
}

export function sortByTerm<T extends { term: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.term.localeCompare(b.term, "ro"));
}

/** Exported so callers outside this module (e.g. the sitemap) can stat the file without re-deriving the content-path convention. */
export function termFilePath(locale: Locale, slug: string): string {
  return contentFilePath(CONTENT_DIR, locale, slug);
}

function readTermFile(locale: Locale, slug: string): GlossaryEntry {
  const filePath = termFilePath(locale, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseGlossaryFrontmatter(data, filePath);

  if (frontmatter.seeAlso) {
    validateSeeAlso(frontmatter.seeAlso, locale, filePath);
  }

  return { ...frontmatter, extended: content, servedLocale: locale };
}

/** Every slug that exists in at least one locale's content/glossary directory. */
function listAllSlugs(): string[] {
  const slugs = new Set<string>();
  for (const candidate of routing.locales) {
    for (const slug of listMdxSlugs(CONTENT_DIR, candidate)) {
      slugs.add(slug);
    }
  }
  return [...slugs];
}

export const getTermBySlug = cache(
  (slug: string, locale: Locale): GlossaryEntry | undefined => {
    const availableLocales = routing.locales.filter((candidate) =>
      fs.existsSync(termFilePath(candidate, slug)),
    );
    const servedLocale = resolveServedLocale(locale, availableLocales);

    return servedLocale ? readTermFile(servedLocale, slug) : undefined;
  },
);

/**
 * Every glossary entry available for `locale`, falling back per-slug to ro
 * via getTermBySlug rather than just listing whatever .mdx files happen to
 * exist for `locale` — so a ro-only term still appears (its servedLocale
 * marks it as a fallback) instead of silently shrinking the list the
 * moment locale parity breaks (AGENTS.md: never a silent language switch).
 */
export const getAllTerms = cache((locale: Locale): GlossaryEntry[] => {
  const entries = listAllSlugs()
    .map((slug) => getTermBySlug(slug, locale))
    .filter((entry): entry is GlossaryEntry => entry !== undefined);
  return sortByTerm(entries);
});

export const getTermSlugs = cache((locale: Locale): string[] => {
  return listMdxSlugs(CONTENT_DIR, locale);
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
