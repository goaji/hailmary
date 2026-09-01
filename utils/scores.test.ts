import { describe, expect, it } from "vitest";
import {
  ALL_GAMES_FIXTURE,
  FINAL_GAME,
  LIVE_GAME,
  MALFORMED_GAME,
  POSTPONED_GAME,
  SCHEDULED_GAME,
} from "./__fixtures__/balldontlie-games";
import { normalizeGame, normalizeGames } from "./scores";

describe("normalizeGame", () => {
  const cases: Array<[string, typeof SCHEDULED_GAME, Partial<ReturnType<typeof normalizeGame>>]> = [
    [
      "a scheduled game",
      SCHEDULED_GAME,
      { status: "scheduled", homeTeamId: "bal", awayTeamId: "cin" },
    ],
    [
      "a live game",
      LIVE_GAME,
      { status: "live", homeTeamId: "kc", awayTeamId: "buf", homeScore: 14, awayScore: 10 },
    ],
    [
      "a final game",
      FINAL_GAME,
      { status: "final", homeTeamId: "phi", awayTeamId: "dal", homeScore: 27, awayScore: 20 },
    ],
    [
      "a postponed game",
      POSTPONED_GAME,
      { status: "postponed", homeTeamId: "mia", awayTeamId: "ne" },
    ],
  ];

  for (const [label, raw, expected] of cases) {
    it(`normalizes ${label}`, () => {
      const game = normalizeGame(raw);
      expect(game).toMatchObject(expected);
      expect(game.id).toBe(String(raw.id));
      expect(game.week).toBe(raw.week);
    });
  }

  it("omits scores rather than defaulting to 0 when the provider has none yet", () => {
    const game = normalizeGame(SCHEDULED_GAME);
    expect(game.homeScore).toBeUndefined();
    expect(game.awayScore).toBeUndefined();
  });

  it("throws with the raw value for an unmapped team abbreviation", () => {
    expect(() => normalizeGame(MALFORMED_GAME)).toThrow(/XYZ/);
  });
});

describe("normalizeGames", () => {
  it("skips a malformed record and logs it, keeping the rest of the payload", () => {
    const games = normalizeGames(ALL_GAMES_FIXTURE);
    expect(games).toHaveLength(ALL_GAMES_FIXTURE.length - 1);
    expect(games.some((game) => game.homeTeamId === "bal")).toBe(true);
    expect(games.some((game) => game.id === String(MALFORMED_GAME.id))).toBe(false);
  });

  it("returns an empty array for an empty payload", () => {
    expect(normalizeGames([])).toEqual([]);
  });
});
