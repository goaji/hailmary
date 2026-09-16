import type { Locale } from "@/i18n";
import type { Conference, Division, Team } from "@/utils/teams";
import { CATEGORY_IDS, type Category, type Game, type GameStatus, type Tag } from "@hailmary/shared";

export { CATEGORY_IDS };
export type { Locale, Team, Conference, Division, Category, Tag, Game, GameStatus };

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

export const WIKI_STRAND_IDS = [
  "the-game",
  "chess-match",
  "the-league",
  "the-numbers",
  "istorie",
] as const;

export type WikiStrandId = (typeof WIKI_STRAND_IDS)[number];

// Cosmetic only (ToC label, prev/next framing) — storage is identical across shapes.
export const WIKI_PAGE_SHAPES = ["flat", "parent", "collection"] as const;

export type WikiPageShape = (typeof WIKI_PAGE_SHAPES)[number];

export type WikiPageFrontmatter = {
  title: string;
  description: string;
  strand: WikiStrandId;
  /** Position in this strand's rail list and prev/next thread — unique within the strand, not global. */
  order: number;
  shape: WikiPageShape;
  sections: ReferenceSection[];
  /** Present only on the timeline shape (e.g. origins & growth of the NFL); absent on sectioned-MDX pages. */
  entries?: TimelineEntry[];
};

export type WikiPage = {
  slug: string;
  frontmatter: WikiPageFrontmatter;
  content: string;
  /** Same data as frontmatter.sections, exposed directly for the TOC. */
  sections: ReferenceSection[];
};

export type WikiStrandGroup = {
  strand: WikiStrandId;
  /** This strand's pages, sorted by frontmatter.order. */
  pages: WikiPage[];
};

export type WikiPrevNextEntry = {
  strand: WikiStrandId;
  slug: string;
  title: string;
};

export type WikiPrevNext = {
  prev?: WikiPrevNextEntry;
  next?: WikiPrevNextEntry;
};
