import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";
import { routing } from "@/routing";
import type {
  Locale,
  ReferencePage,
  ReferencePageFrontmatter,
  ReferenceSection,
  TimelineEntry,
} from "@/types";

const CONTENT_DIR = path.join(process.cwd(), "content", "reference");

const referenceSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.union([z.literal(2), z.literal(3)]).default(2),
});

const timelineEntrySchema = z.object({
  year: z.string(),
  title: z.string(),
  body: z.string(),
  era: z.string(),
});

const referenceFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  sections: z.array(referenceSectionSchema).min(1),
  entries: z.array(timelineEntrySchema).optional(),
});

/** Throws naming the file and field on invalid frontmatter — never falls back silently. */
export function parseReferenceFrontmatter(
  data: unknown,
  filePath: string,
): ReferencePageFrontmatter {
  const result = referenceFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join(".") || "(root)";
    throw new Error(
      `Invalid frontmatter in ${filePath}: field "${field}" — ${issue.message}`,
    );
  }

  return result.data;
}

const H2_PATTERN = /^##\s+(.+?)\s*$/gm;

/** Every top-level (`##`) heading in raw MDX content, in document order. */
export function extractH2Headings(content: string): string[] {
  return [...content.matchAll(H2_PATTERN)].map((match) => match[1].trim());
}

/** Slices raw MDX (each `##` heading through the next) into one per-section chunk, aligned by position to `sections`. */
export function splitSectionContent(
  content: string,
  sections: ReferenceSection[],
): Array<ReferenceSection & { body: string }> {
  const starts = [...content.matchAll(H2_PATTERN)].map((match) => match.index);

  return sections.map((section, index) => {
    const start = starts[index];
    const end = index + 1 < starts.length ? starts[index + 1] : content.length;
    return { ...section, body: content.slice(start, end).trim() };
  });
}

/** Section ids are never derived from heading text — this is what catches a heading drifting out of sync with frontmatter. */
export function validateSectionHeadings(
  content: string,
  sections: { id: string; title: string }[],
  filePath: string,
): void {
  const headings = extractH2Headings(content);

  if (headings.length !== sections.length) {
    throw new Error(
      `${filePath}: frontmatter declares ${sections.length} section(s) but content has ${headings.length} "##" heading(s)`,
    );
  }

  sections.forEach((section, index) => {
    if (headings[index] !== section.title) {
      throw new Error(
        `${filePath}: section #${index + 1} ("${section.id}") declares title "${section.title}" but the matching "##" heading reads "${headings[index]}"`,
      );
    }
  });
}

/** The timeline shape's equivalent contract check: era ids replace a literal per-era heading. */
export function validateEntryEras(
  entries: TimelineEntry[],
  sections: { id: string }[],
  filePath: string,
): void {
  const ids = new Set(sections.map((section) => section.id));

  for (const entry of entries) {
    if (!ids.has(entry.era)) {
      throw new Error(
        `${filePath}: timeline entry "${entry.title}" (${entry.year}) references unknown era "${entry.era}"`,
      );
    }
  }
}

export type EraGroup = {
  section: ReferenceSection;
  entries: TimelineEntry[];
  /** 1-based ordinal of this group's first entry, continuing the count across eras (an <ol> per era otherwise restarts at 1). */
  startOrdinal: number;
};

/** Buckets timeline entries under their declared era section, in section order, tracking a running ordinal across the whole timeline. */
export function groupEntriesByEra(
  entries: TimelineEntry[],
  sections: ReferenceSection[],
): EraGroup[] {
  let ordinal = 1;

  return sections.map((section) => {
    const group = entries.filter((entry) => entry.era === section.id);
    const startOrdinal = ordinal;
    ordinal += group.length;
    return { section, entries: group, startOrdinal };
  });
}

const SEE_ALSO_PATTERN = /^\/([a-z0-9-]+)(?:#([a-z0-9-]+))?$/;

/** Parses a glossary `seeAlso` route like "/regulament#pase". */
export function parseSeeAlso(
  seeAlso: string,
): { slug: string; id?: string } | undefined {
  const match = SEE_ALSO_PATTERN.exec(seeAlso);
  return match ? { slug: match[1], id: match[2] || undefined } : undefined;
}

function referenceFilePath(locale: Locale, slug: string): string {
  return path.join(CONTENT_DIR, locale, `${slug}.mdx`);
}

function readReferenceFile(locale: Locale, slug: string): ReferencePage {
  const filePath = referenceFilePath(locale, slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseReferenceFrontmatter(data, filePath);

  if (frontmatter.entries) {
    validateEntryEras(frontmatter.entries, frontmatter.sections, filePath);
  } else {
    validateSectionHeadings(content, frontmatter.sections, filePath);
  }

  return { frontmatter, content, sections: frontmatter.sections };
}

/** No locale fallback, unlike articles/glossary — a missing `en` file must 404, not silently serve `ro`. */
export const getReferencePage = cache(
  (slug: string, locale: Locale): ReferencePage | undefined => {
    const filePath = referenceFilePath(locale, slug);
    return fs.existsSync(filePath) ? readReferenceFile(locale, slug) : undefined;
  },
);

/** Which locales have a real file for this reference slug — for hreflang and generateStaticParams. */
export const getReferenceLocales = cache((slug: string): Locale[] => {
  return routing.locales.filter((candidate) =>
    fs.existsSync(referenceFilePath(candidate, slug)),
  );
});

/** Fails the build if a glossary `seeAlso` points at a page/section that doesn't exist — the only place a dangling link is caught. */
export function validateSeeAlso(seeAlso: string, locale: Locale, filePath: string): void {
  const parsed = parseSeeAlso(seeAlso);

  if (!parsed) {
    throw new Error(`${filePath}: seeAlso "${seeAlso}" is not a valid internal route`);
  }

  const page = getReferencePage(parsed.slug, locale);

  if (!page) {
    throw new Error(
      `${filePath}: seeAlso "${seeAlso}" points at reference page "${parsed.slug}", which has no "${locale}" content`,
    );
  }

  if (parsed.id && !page.sections.some((section) => section.id === parsed.id)) {
    throw new Error(
      `${filePath}: seeAlso "${seeAlso}" points at section "#${parsed.id}" on "${parsed.slug}", which doesn't exist`,
    );
  }
}
