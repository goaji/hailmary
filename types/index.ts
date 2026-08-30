import type { Locale } from "@/i18n";
import type { Team } from "@/utils/teams";

export type { Locale, Team };

// Article categories — six to eight ids covering the mockup's four card
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

export type GlossaryEntry = {
  slug: string;
  term: string;
  shortDef: string;
  body: string;
  related?: string[];
  category: string; // string for now, will be tighten once lib/glossary.ts establishes a real set.
};
