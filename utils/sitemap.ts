import "server-only";

import fs from "node:fs";

/**
 * Picks the freshest real signal for a sitemap entry's `lastModified`: an
 * ISO date/datetime string when present, otherwise a fallback `Date` —
 * never `new Date()`, which would claim a page changed on every build.
 */
export function resolveLastModified(
  iso: string | null | undefined,
  fallback: Date,
): Date {
  return iso ? new Date(iso) : fallback;
}

/**
 * The most recently modified file among `filePaths` — for a page like
 * /glosar that aggregates many content files and has no single
 * frontmatter date of its own. Returns the epoch for an empty list, which
 * callers should treat as "no real signal available."
 */
export function latestMtime(filePaths: string[]): Date {
  return filePaths.reduce((latest, filePath) => {
    const mtime = fs.statSync(filePath).mtime;
    return mtime > latest ? mtime : latest;
  }, new Date(0));
}
