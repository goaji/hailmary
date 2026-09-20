import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import { WIKI_PAGE_SHAPES, WIKI_STRAND_IDS } from "@/types";
import type {
  Locale,
  WikiPage,
  WikiPageFrontmatter,
  WikiPrevNext,
  WikiStrandGroup,
  WikiStrandId,
} from "@/types";
import { parseFrontmatter } from "@/utils/content";
import {
  referenceSectionSchema,
  timelineEntrySchema,
  validateEntryEras,
  validateSectionHeadings,
} from "@/utils/reference";

const CONTENT_DIR = path.join(process.cwd(), "content", "wiki");

const wikiFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  strand: z.enum(WIKI_STRAND_IDS),
  order: z.number().int().positive(),
  shape: z.enum(WIKI_PAGE_SHAPES),
  sections: z.array(referenceSectionSchema).min(1),
  entries: z.array(timelineEntrySchema).optional(),
});

export function parseWikiFrontmatter(data: unknown, filePath: string): WikiPageFrontmatter {
  return parseFrontmatter(wikiFrontmatterSchema, data, filePath);
}

export function isWikiStrandId(value: string): value is WikiStrandId {
  return (WIKI_STRAND_IDS as readonly string[]).includes(value);
}

/** Exported so callers outside this module (e.g. the sitemap) can stat the file without re-deriving the content-path convention. */
export function wikiFilePath(locale: Locale, strand: WikiStrandId, slug: string): string {
  return path.join(CONTENT_DIR, locale, strand, `${slug}.mdx`);
}

/** mtime of the wiki MDX file backing `strand`/`slug`/`locale` — the sitemap's freshness signal for a page with no frontmatter "last changed" date of its own. */
export function getWikiLastModified(locale: Locale, strand: WikiStrandId, slug: string): Date {
  return fs.statSync(wikiFilePath(locale, strand, slug)).mtime;
}

function readWikiFile(locale: Locale, strand: WikiStrandId, slug: string): WikiPage {
  const filePath = wikiFilePath(locale, strand, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseWikiFrontmatter(data, filePath);

  if (frontmatter.strand !== strand) {
    throw new Error(
      `${filePath}: file lives under strand "${strand}" but frontmatter declares strand "${frontmatter.strand}"`,
    );
  }

  if (frontmatter.entries) {
    validateEntryEras(frontmatter.entries, frontmatter.sections, filePath);
  } else {
    validateSectionHeadings(content, frontmatter.sections, filePath);
  }

  return { slug, frontmatter, content, sections: frontmatter.sections };
}

/** No locale fallback, same contract as getReferencePage — a missing translation must 404, not silently serve ro. */
export const getWikiPage = cache(
  (strand: WikiStrandId, slug: string, locale: Locale): WikiPage | undefined => {
    const filePath = wikiFilePath(locale, strand, slug);
    return fs.existsSync(filePath) ? readWikiFile(locale, strand, slug) : undefined;
  },
);

/** Which locales have a real file for this strand/slug — for hreflang and generateStaticParams. */
export const getWikiPageLocales = cache((strand: WikiStrandId, slug: string): Locale[] => {
  return routing.locales.filter((candidate) =>
    fs.existsSync(wikiFilePath(candidate, strand, slug)),
  );
});

/** Every {strand, slug} pair with a file under content/wiki/<locale>, unordered. */
function listWikiPageKeys(locale: Locale): Array<{ strand: WikiStrandId; slug: string }> {
  const localeDir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(localeDir)) {
    return [];
  }

  return fs.readdirSync(localeDir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || !isWikiStrandId(entry.name)) {
      return [];
    }
    const strand = entry.name;
    const strandDir = path.join(localeDir, strand);
    return fs
      .readdirSync(strandDir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => ({ strand, slug: file.replace(/\.mdx$/, "") }));
  });
}

export const getAllWikiPages = cache((locale: Locale): WikiPage[] => {
  return listWikiPageKeys(locale)
    .map(({ strand, slug }) => getWikiPage(strand, slug, locale))
    .filter((page): page is WikiPage => page !== undefined);
});

/** Throws if two pages in the same strand share an `order` — a silent duplicate would make prev/next and the rail order ambiguous. */
export function validateUniqueOrder(strand: WikiStrandId, pages: WikiPage[]): void {
  const seenBy = new Map<number, string>();

  for (const page of pages) {
    const order = page.frontmatter.order;
    const existingSlug = seenBy.get(order);
    if (existingSlug) {
      throw new Error(
        `Wiki strand "${strand}": pages "${existingSlug}" and "${page.slug}" both declare order ${order} — reading order must be unique within a strand`,
      );
    }
    seenBy.set(order, page.slug);
  }
}

/** Pure grouping/sort — pages by strand (in WIKI_STRAND_IDS order), each strand's pages by frontmatter.order. */
export function groupPagesByStrand(pages: WikiPage[]): WikiStrandGroup[] {
  return WIKI_STRAND_IDS.map((strand) => {
    const strandPages = pages
      .filter((page) => page.frontmatter.strand === strand)
      .sort((a, b) => a.frontmatter.order - b.frontmatter.order);

    validateUniqueOrder(strand, strandPages);

    return { strand, pages: strandPages };
  });
}

export const getWikiStrandTree = cache((locale: Locale): WikiStrandGroup[] => {
  return groupPagesByStrand(getAllWikiPages(locale));
});

/** Pure — prev/next within a single strand's already-ordered page list. */
export function computePrevNext(strandPages: WikiPage[], slug: string): WikiPrevNext {
  const index = strandPages.findIndex((page) => page.slug === slug);
  if (index === -1) {
    return {};
  }

  const previousPage = strandPages[index - 1];
  const nextPage = strandPages[index + 1];

  return {
    prev: previousPage
      ? {
          strand: previousPage.frontmatter.strand,
          slug: previousPage.slug,
          title: previousPage.frontmatter.title,
        }
      : undefined,
    next: nextPage
      ? {
          strand: nextPage.frontmatter.strand,
          slug: nextPage.slug,
          title: nextPage.frontmatter.title,
        }
      : undefined,
  };
}

export const getWikiPrevNext = cache(
  (strand: WikiStrandId, slug: string, locale: Locale): WikiPrevNext => {
    const group = getWikiStrandTree(locale).find((candidate) => candidate.strand === strand);
    return group ? computePrevNext(group.pages, slug) : {};
  },
);

const SEE_ALSO_PATTERN = /^\/wiki\/([a-z0-9-]+)\/([a-z0-9-]+)(?:#([a-z0-9-]+))?$/;

/** Parses a glossary `seeAlso` route like "/wiki/chess-match/strategie-ofensiva". */
export function parseSeeAlso(
  seeAlso: string,
): { strand: string; slug: string; id?: string } | undefined {
  const match = SEE_ALSO_PATTERN.exec(seeAlso);
  return match ? { strand: match[1], slug: match[2], id: match[3] || undefined } : undefined;
}

/** Fails the build if a glossary `seeAlso` points at a wiki page/section that doesn't exist — the only place a dangling link is caught. */
export function validateSeeAlso(seeAlso: string, locale: Locale, filePath: string): void {
  const parsed = parseSeeAlso(seeAlso);

  if (!parsed || !isWikiStrandId(parsed.strand)) {
    throw new Error(`${filePath}: seeAlso "${seeAlso}" is not a valid internal route`);
  }

  const page = getWikiPage(parsed.strand, parsed.slug, locale);

  if (!page) {
    throw new Error(
      `${filePath}: seeAlso "${seeAlso}" points at wiki page "${parsed.strand}/${parsed.slug}", which has no "${locale}" content`,
    );
  }

  if (parsed.id && !page.sections.some((section) => section.id === parsed.id)) {
    throw new Error(
      `${filePath}: seeAlso "${seeAlso}" points at section "#${parsed.id}" on "${parsed.strand}/${parsed.slug}", which doesn't exist`,
    );
  }
}
