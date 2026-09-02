import type { Locale } from "@/i18n";
import type { Conference, Division, Team } from "@/utils/teams";
import type { Tag } from "@/utils/tags";

export type { Locale, Team, Conference, Division, Tag };

// Categories for ARTICLES — six to eight ids covering the mockup's four card
// chips (transferuri, accidentari, analiza, antrenori) plus Draft, Program and Regulament. 
// this file stays the single source of truth for which ids are allowed to exist.
export const CATEGORY_IDS = [
  "transferuri",
  "accidentari",
  "analiza",
  "antrenori",
  "draft",
  "program",
  "regulament",
] as const;

export type Category = (typeof CATEGORY_IDS)[number];

export type ArticleImage = {
  src: string;
  alt: string;
  /** Hero figure caption. Omit rather than passing an empty string. */
  caption?: string;
};

export type ArticleFrontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
  /** ISO date string, e.g. "2026-08-24" */
  publishedAt: string;
  author: string;
  /** Omit to fall back to one of the site's default cover images — see `pickDefaultImage` in `utils/articles.ts`. */
  image?: ArticleImage;
  featured?: boolean;
  tags?: Tag[];
  /** Editorial superlative badge (e.g. "SUPER BOWL LX") — not the category. */
  kicker?: string;
  /** Team slugs this article is about — powers /echipe/[team]'s news section and ArticleCard's TeamBadge. */
  teams?: string[];
};

export type Article = ArticleFrontmatter & {
  content: string;
  /** Always set — `readArticleFile` fills in a default when frontmatter omits `image`. */
  image: ArticleImage;
  /** Which locale actually served this article — the i18n fallback contract. */
  servedLocale: Locale;
  /** Estimated minutes to read the body, computed at parse time. */
  readingTimeMinutes: number;
};

export type GameStatus = "scheduled" | "live" | "halftime" | "final" | "postponed";

export type Game = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  /** ISO datetime string */
  kickoff: string;
  week: number;
  status: GameStatus;
  homeScore?: number;
  awayScore?: number;
  quarter?: number;
  clock?: string;
};

// Categories for GLOSSARY terms,
export const GLOSSARY_CATEGORY_IDS = [
  "reguli",
  "pozitii",
  "pariuri",
  "generale",
] as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORY_IDS)[number];

export type GlossaryEntryFrontmatter = {
  slug: string;
  term: string;
  /** One sentence — glossary list + tooltip. */
  short: string;
  category: GlossaryCategory;
  /** Other entry slugs. */
  relatedTerms?: string[];
  /** A route, e.g. "/regulament#pase". */
  seeAlso?: string;
};

export type GlossaryEntry = GlossaryEntryFrontmatter & {
  /** MDX string — the panel body. */
  extended: string;
  /** Which locale actually served this entry — the i18n fallback contract. */
  servedLocale: Locale;
};

// Each section id is declared in frontmatter, never derived from heading text — it's what glossary `seeAlso` deep-links into.
export type ReferenceSection = {
  id: string;
  title: string;
  level: 2 | 3;
};

export type TimelineEntry = {
  year: string;
  title: string;
  body: string;
  /** id of the ReferenceSection (era) this entry groups under. */
  era: string;
};

export type ReferencePageFrontmatter = {
  title: string;
  description: string;
  sections: ReferenceSection[];
  /** Present only on the timeline shape (istorie); absent on sectioned-MDX pages (regulament). */
  entries?: TimelineEntry[];
};

export type ReferencePage = {
  frontmatter: ReferencePageFrontmatter;
  content: string;
  /** Same data as frontmatter.sections, exposed directly for the TOC. */
  sections: ReferenceSection[];
};
