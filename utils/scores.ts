import "server-only";

import type { Game, GameStatus } from "@/types";

// Raw shapes mirror balldontlie's NFL /v1/games response (nfl.balldontlie.io
// docs, fetched 2026-09-01) — not yet checked against a live payload, since
// writing this normalizer predates having an API key. Re-verify field names
// and the `date` field's time-of-day granularity once step 4 has a real key.
export type RawTeam = {
  id: number;
  abbreviation: string;
  full_name: string;
  location: string;
  name: string;
  conference: string;
  division: string;
};

export type RawGame = {
  id: number;
  season: number;
  week: number;
  postseason: boolean;
  date: string;
  status: string;
  status_state: string;
  home_team: RawTeam;
  visitor_team: RawTeam;
  home_team_score: number | null;
  visitor_team_score: number | null;
};

// Provider abbreviation -> our slug. Explicit table, never string-matching
// on team name. WSH is the one confirmed divergence from our slugs.
const TEAM_ID_MAP: Record<string, string> = {
  ARI: "ari",
  ATL: "atl",
  BAL: "bal",
  BUF: "buf",
  CAR: "car",
  CHI: "chi",
  CIN: "cin",
  CLE: "cle",
  DAL: "dal",
  DEN: "den",
  DET: "det",
  GB: "gb",
  HOU: "hou",
  IND: "ind",
  JAX: "jax",
  KC: "kc",
  LAC: "lac",
  LAR: "lar",
  LV: "lv",
  MIA: "mia",
  MIN: "min",
  NE: "ne",
  NO: "no",
  NYG: "nyg",
  NYJ: "nyj",
  PHI: "phi",
  PIT: "pit",
  SEA: "sea",
  SF: "sf",
  TB: "tb",
  TEN: "ten",
  WSH: "was",
};

// status_state values per the provider's docs. There is no "halftime"
// value and no clock/period field on the free tier, so halftime is
// unreachable from this provider today — it always normalizes to "live".
const STATUS_MAP: Record<string, GameStatus> = {
  scheduled: "scheduled",
  in_progress: "live",
  final: "final",
  postponed: "postponed",
  canceled: "postponed",
  delayed: "scheduled",
  suspended: "live",
  abandoned: "postponed",
};

function mapTeamId(raw: RawTeam): string {
  const slug = TEAM_ID_MAP[raw.abbreviation];
  if (!slug) {
    throw new Error(
      `scores: unmapped provider team abbreviation "${raw.abbreviation}" (raw: ${JSON.stringify(raw)})`,
    );
  }
  return slug;
}

function mapStatus(raw: RawGame): GameStatus {
  return STATUS_MAP[raw.status_state] ?? "scheduled";
}

/** Maps one provider game record to our `Game` shape. Throws on an unmapped team. */
export function normalizeGame(raw: RawGame): Game {
  const game: Game = {
    id: String(raw.id),
    homeTeamId: mapTeamId(raw.home_team),
    awayTeamId: mapTeamId(raw.visitor_team),
    kickoff: raw.date,
    week: raw.week,
    status: mapStatus(raw),
  };
  if (raw.home_team_score != null) {
    game.homeScore = raw.home_team_score;
  }
  if (raw.visitor_team_score != null) {
    game.awayScore = raw.visitor_team_score;
  }
  return game;
}

/** Normalizes a full payload, skipping and logging individually bad records. */
export function normalizeGames(rawGames: RawGame[]): Game[] {
  const games: Game[] = [];
  for (const raw of rawGames) {
    try {
      games.push(normalizeGame(raw));
    } catch (error) {
      console.error("scores: skipping malformed game record", error, raw);
    }
  }
  return games;
}
