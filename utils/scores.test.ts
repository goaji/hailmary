import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ALL_GAMES_FIXTURE,
  FINAL_GAME,
  LIVE_GAME,
  MALFORMED_GAME,
  POSTPONED_GAME,
  SCHEDULED_GAME,
} from "./__fixtures__/balldontlie-games";
import { fetchSeasonGames, normalizeGame, normalizeGames } from "./scores";

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

describe("fetchSeasonGames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes the data array from a successful single-page response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ data: [SCHEDULED_GAME, LIVE_GAME], meta: { next_cursor: null } }),
          { status: 200 },
        ),
      ),
    );

    const result = await fetchSeasonGames("test-key", 2026);
    expect(result).toEqual({ ok: true, games: [normalizeGame(SCHEDULED_GAME), normalizeGame(LIVE_GAME)] });
  });

  it("sends the API key and scopes the request to the season's regular-season games", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ data: [], meta: { next_cursor: null } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchSeasonGames("test-key", 2026);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("seasons%5B%5D=2026");
    expect(String(url)).toContain("season_types%5B%5D=2");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "test-key" });
  });

  it("follows meta.next_cursor across pages and combines the results", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [SCHEDULED_GAME], meta: { next_cursor: 42 } }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [LIVE_GAME], meta: { next_cursor: null } }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchSeasonGames("test-key", 2026);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain("cursor=42");
    expect(result).toEqual({ ok: true, games: [normalizeGame(SCHEDULED_GAME), normalizeGame(LIVE_GAME)] });
  });

  it("returns a failure reason on a non-2xx response, without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));

    const result = await fetchSeasonGames("test-key", 2026);
    expect(result).toEqual({ ok: false, reason: "provider responded 500" });
  });

  it("returns a failure reason on a network error, without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    const result = await fetchSeasonGames("test-key", 2026);
    expect(result).toEqual({ ok: false, reason: "network error: boom" });
  });

  it("returns a failure reason when the response body has no data array", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ oops: true }), { status: 200 })));

    const result = await fetchSeasonGames("test-key", 2026);
    expect(result).toEqual({ ok: false, reason: "provider response missing a data array" });
  });

  it("succeeds with an empty games array when the provider has nothing to report", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [], meta: { next_cursor: null } }), { status: 200 })),
    );

    const result = await fetchSeasonGames("test-key", 2026);
    expect(result).toEqual({ ok: true, games: [] });
  });
});
