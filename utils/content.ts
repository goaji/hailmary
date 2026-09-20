import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import type { Locale } from "@/types";

/** path.join(baseDir, locale, `${slug}.mdx`) — the content-file convention shared by articles/glossary/reference. */
export function contentFilePath(baseDir: string, locale: Locale, slug: string): string {
  return path.join(baseDir, locale, `${slug}.mdx`);
}

/** Slugs of every `.mdx` file directly under `baseDir/locale`, or `[]` if that directory doesn't exist. */
export function listMdxSlugs(baseDir: string, locale: Locale): string[] {
  const dir = path.join(baseDir, locale);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function walkMdxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkMdxFiles(entryPath);
    }
    return entry.name.endsWith(".mdx") ? [entryPath] : [];
  });
}

/**
 * Slugs of every `.mdx` file under `baseDir/locale`, searched at any depth —
 * for content nested into subdirectories (e.g. articles stored under a
 * `<year>/<month>/` path) rather than stored flat. `[]` if the locale
 * directory doesn't exist.
 */
export function listMdxSlugsRecursive(baseDir: string, locale: Locale): string[] {
  const dir = path.join(baseDir, locale);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return walkMdxFiles(dir).map((filePath) => path.basename(filePath, ".mdx"));
}

/**
 * Full path of the `.mdx` file for `slug` under `baseDir/locale`, searched
 * at any depth — the nested-storage counterpart to `contentFilePath`.
 * `undefined` if the locale directory doesn't exist or has no file with
 * that slug.
 */
export function findMdxFilePath(baseDir: string, locale: Locale, slug: string): string | undefined {
  const dir = path.join(baseDir, locale);

  if (!fs.existsSync(dir)) {
    return undefined;
  }

  return walkMdxFiles(dir).find((filePath) => path.basename(filePath, ".mdx") === slug);
}

/**
 * Which locale to actually serve for a request, given which locales have
 * a translation on disk. Falls back to `ro` — the caller decides whether
 * to show a fallback notice, this function only decides what content to
 * load.
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
 * Validates raw frontmatter data against `schema`. Throws naming the file
 * path and the offending field on failure — never silently falls back to
 * a default, since that would hide a content typo forever.
 */
export function parseFrontmatter<T>(schema: z.ZodType<T>, data: unknown, filePath: string): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join(".") || "(root)";
    throw new Error(`Invalid frontmatter in ${filePath}: field "${field}" — ${issue.message}`);
  }

  return result.data;
}
