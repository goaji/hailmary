import type { RawGame } from "@/utils/scores";

// Docs-derived samples (balldontlie NFL /v1/games shape, not live-captured
// — see the provenance note at the top of utils/scores.ts). One record per
// case the normalizer must handle correctly.

function team(abbreviation: string, name: string): RawGame["home_team"] {
  return {
    id: 1,
    abbreviation,
    full_name: `${name} Team`,
    location: name,
    name,
    conference: "AFC",
    division: "North",
  };
}

export const SCHEDULED_GAME: RawGame = {
  id: 1001,
  season: 2026,
  week: 2,
  postseason: false,
  date: "2026-09-13T17:00:00Z",
  status: "Scheduled",
  status_state: "scheduled",
  home_team: team("BAL", "Ravens"),
  visitor_team: team("CIN", "Bengals"),
  home_team_score: null,
  visitor_team_score: null,
};

export const LIVE_GAME: RawGame = {
  id: 1002,
  season: 2026,
  week: 2,
  postseason: false,
  date: "2026-09-13T20:25:00Z",
  status: "In Progress",
  status_state: "in_progress",
  home_team: team("KC", "Chiefs"),
  visitor_team: team("BUF", "Bills"),
  home_team_score: 14,
  visitor_team_score: 10,
};

export const FINAL_GAME: RawGame = {
  id: 1003,
  season: 2026,
  week: 2,
  postseason: false,
  date: "2026-09-13T20:25:00Z",
  status: "Final",
  status_state: "final",
  home_team: team("PHI", "Eagles"),
  visitor_team: team("DAL", "Cowboys"),
  home_team_score: 27,
  visitor_team_score: 20,
};

export const POSTPONED_GAME: RawGame = {
  id: 1004,
  season: 2026,
  week: 2,
  postseason: false,
  date: "2026-09-14T00:15:00Z",
  status: "Postponed",
  status_state: "postponed",
  home_team: team("MIA", "Dolphins"),
  visitor_team: team("NE", "Patriots"),
  home_team_score: null,
  visitor_team_score: null,
};

// Deliberately malformed: an unmapped provider team abbreviation.
// normalizeGame must throw; normalizeGames must skip and log it, not
// blank the rest of the payload.
export const MALFORMED_GAME: RawGame = {
  id: 1005,
  season: 2026,
  week: 2,
  postseason: false,
  date: "2026-09-14T17:00:00Z",
  status: "Scheduled",
  status_state: "scheduled",
  home_team: team("XYZ", "Unknown"),
  visitor_team: team("SF", "49ers"),
  home_team_score: null,
  visitor_team_score: null,
};

export const ALL_GAMES_FIXTURE: RawGame[] = [
  SCHEDULED_GAME,
  LIVE_GAME,
  FINAL_GAME,
  POSTPONED_GAME,
  MALFORMED_GAME,
];
