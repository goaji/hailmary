import type { MetadataRoute } from "next";
import path from "node:path";
import { getLanguageAlternates, routing, type Locale } from "@/i18n";
import { getAllArticles, getAvailableLocales } from "@/utils/articles";
import { getAllTerms, termFilePath } from "@/utils/glossary";
import { getReferenceLastModified, getReferenceLocales } from "@/utils/reference";
import { getSchedule, getScheduleFixtureLastModified } from "@/utils/schedule";
import { latestMtime, resolveLastModified } from "@/utils/sitemap";
import { SITE_URL } from "@/utils/site";
import { TEAMS } from "@/utils/teams";

// Same freshness window as the article page's fallback revalidate — the
// score store (backing /program's lastModified) changes far more often
// than a rebuild, but a sitemap doesn't need to be request-fresh.
export const revalidate = 3600;

const REFERENCE_SLUGS = ["istorie", "regulament"] as const;
// teams.ts is imported directly by client components (TeamColorProvider,
// TeamPicker), so it can't itself take a node:fs import — latestMtime (the
// sitemap's own freshness helper) stats it from out here instead.
const TEAMS_FILE = path.join(process.cwd(), "utils", "teams.ts");

function withSiteUrl(languages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languages).map(([locale, pathname]) => [
      locale,
      `${SITE_URL}${pathname}`,
    ]),
  );
}

/** One sitemap entry for `pathname` under `locale`, with hreflang alternates limited to `availableLocales` — the mechanism that keeps Romanian-only content from advertising an `en` URL. */
function entry(
  pathname: string,
  locale: Locale,
  availableLocales: readonly Locale[],
  lastModified: Date,
): MetadataRoute.Sitemap[number] {
  const languages = getLanguageAlternates(pathname, availableLocales);

  return {
    url: `${SITE_URL}${languages[locale]}`,
    lastModified,
    alternates: { languages: withSiteUrl(languages) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  const roArticles = getAllArticles("ro");
  const homeLastModified = resolveLastModified(roArticles[0]?.publishedAt, new Date(0));
  for (const locale of routing.locales) {
    entries.push(entry("/", locale, routing.locales, homeLastModified));
    entries.push(entry("/stiri", locale, routing.locales, homeLastModified));
  }

  // News is ro-only: every article gets one ro entry, never an /en one.
  for (const article of roArticles) {
    entries.push(
      entry(
        `/stiri/${article.slug}`,
        "ro",
        getAvailableLocales(article.slug),
        resolveLastModified(article.publishedAt, new Date(0)),
      ),
    );
  }

  // Reference pages: only locales with a real file resolve.
  for (const slug of REFERENCE_SLUGS) {
    const locales = getReferenceLocales(slug);
    for (const locale of locales) {
      const lastModified = getReferenceLastModified(locale, slug);
      entries.push(entry(`/${slug}`, locale, locales, lastModified));
    }
  }

  // Glossary: one page per locale, dated by its newest backing term file.
  for (const locale of routing.locales) {
    const files = getAllTerms(locale).map((term) => termFilePath(locale, term.slug));
    entries.push(entry("/glosar", locale, routing.locales, latestMtime(files)));
  }

  // Team pages share one freshness signal: the single source-of-truth file.
  const teamsLastModified = latestMtime([TEAMS_FILE]);
  for (const team of TEAMS) {
    for (const locale of routing.locales) {
      entries.push(entry(`/echipe/${team.slug}`, locale, routing.locales, teamsLastModified));
    }
  }
  for (const locale of routing.locales) {
    entries.push(entry("/echipe", locale, routing.locales, teamsLastModified));
  }

  // /program: the live store's updatedAt when synced, else the fixture file's own mtime.
  const scheduleLastModified = resolveLastModified(
    getSchedule().updatedAt,
    getScheduleFixtureLastModified(),
  );
  for (const locale of routing.locales) {
    entries.push(entry("/program", locale, routing.locales, scheduleLastModified));
  }

  return entries;
}
