import "server-only";

import type { Game, GameStatus } from "@/types";

// Docs-derived shape (nfl.balldontlie.io), not yet checked against a live payload — re-verify field names and `date`'s time granularity once there's a real key.
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

// Provider abbreviation -> our slug, explicit table. WSH is the one confirmed divergence from our slugs.
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

// No "halftime" status_state and no clock/period on the free tier — halftime is unreachable from this provider, always normalizes to "live".
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

const GAMES_URL = "https://api.balldontlie.io/nfl/v1/games";
const FETCH_TIMEOUT_MS = 8_000;

export type FetchGamesOutcome = { ok: true; games: Game[] } | { ok: false; reason: string };

function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Today+yesterday (UTC) in one call, not a "current week" call — no season calendar to compute that from, and this covers a late US kickoff crossing UTC midnight. Envelope shape ({ data: [...] }) is also unverified — re-check with a real key.
export async function fetchLatestGames(
  apiKey: string,
  now: Date = new Date(),
): Promise<FetchGamesOutcome> {
  const url = new URL(GAMES_URL);
  url.searchParams.append("dates[]", utcDateString(new Date(now.getTime() - 86_400_000)));
  url.searchParams.append("dates[]", utcDateString(now));
  url.searchParams.set("per_page", "100");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    return { ok: false, reason: `network error: ${(error as Error).message}` };
  }

  if (!response.ok) {
    return { ok: false, reason: `provider responded ${response.status}` };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, reason: "provider returned invalid JSON" };
  }

  const rawGames = (body as { data?: unknown } | null)?.data;
  if (!Array.isArray(rawGames)) {
    return { ok: false, reason: "provider response missing a data array" };
  }

  return { ok: true, games: normalizeGames(rawGames as RawGame[]) };
}
