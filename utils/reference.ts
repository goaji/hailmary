import "server-only";

import { z } from "zod";
import type { ReferenceSection, TimelineEntry } from "@/types";

// Exported so utils/wiki.ts can reuse this validation instead of a second copy.
export const referenceSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.union([z.literal(2), z.literal(3)]).default(2),
});

export const timelineEntrySchema = z.object({
  year: z.string(),
  title: z.string(),
  body: z.string(),
  era: z.string(),
});

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
