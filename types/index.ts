import type { Locale } from "@/i18n";
import type { Team } from "@/utils/teams";

export type { Locale, Team };

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
  image: ArticleImage;
  featured?: boolean;
  tags?: string[];
  /** Editorial superlative badge (e.g. "SUPER BOWL LX") — not the category. */
  kicker?: string;
};

export type Article = ArticleFrontmatter & {
  content: string;
  /** Which locale actually served this article — the i18n fallback contract. */
  servedLocale: Locale;
};

export type GameStatus = "scheduled" | "live" | "final";

export type Game = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  /** ISO datetime string */
  kickoff: string;
  week: number;
  status: GameStatus;
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
  shortDef: string;
  category: GlossaryCategory;
  related?: string[];
};

export type GlossaryEntry = GlossaryEntryFrontmatter & {
  body: string;
  /** Which locale actually served this entry — the i18n fallback contract. */
  servedLocale: Locale;
};
