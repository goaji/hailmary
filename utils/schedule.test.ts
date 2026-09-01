import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Game } from "@/types";
import {
  getAvailableWeeks,
  getCurrentWeek,
  getSchedule,
  getScheduleFixture,
  selectUpcomingGames,
} from "./schedule";

// Same default path as utils/store.ts, duplicated since only this test needs to reach past readScores(storePath?) to exercise getSchedule()'s own default.
const STORE_PATH = path.join(process.cwd(), ".data", "scores.json");

const LIVE_GAME: Game = {
  id: "2026-w2-kc-buf",
  homeTeamId: "kc",
  awayTeamId: "buf",
  kickoff: "2026-09-13T20:25:00Z",
  week: 2,
  status: "live",
};

beforeEach(() => {
  fs.rmSync(STORE_PATH, { force: true });
});

afterEach(() => {
  fs.rmSync(STORE_PATH, { force: true });
});

function game(overrides: Partial<Game> & Pick<Game, "id" | "week" | "status">): Game {
  return {
    homeTeamId: "kc",
    awayTeamId: "buf",
    kickoff: "2026-09-13T20:25:00Z",
    ...overrides,
  };
}

describe("getAvailableWeeks", () => {
  it("returns distinct week numbers, ascending, regardless of game order", () => {
    const games = [
      game({ id: "a", week: 3, status: "scheduled" }),
      game({ id: "b", week: 1, status: "final" }),
      game({ id: "c", week: 3, status: "live" }),
      game({ id: "d", week: 2, status: "final" }),
    ];
    expect(getAvailableWeeks(games)).toEqual([1, 2, 3]);
  });

  it("returns an empty array for no games", () => {
    expect(getAvailableWeeks([])).toEqual([]);
  });
});

describe("getCurrentWeek", () => {
  it("returns 1 when there are no games at all", () => {
    expect(getCurrentWeek([])).toBe(1);
  });

  it("returns the earliest week with an unresolved game", () => {
    const games = [
      game({ id: "a", week: 1, status: "final" }),
      game({ id: "b", week: 2, status: "scheduled" }),
      game({ id: "c", week: 3, status: "scheduled" }),
    ];
    expect(getCurrentWeek(games)).toBe(2);
  });

  it("falls back to the latest week once every game is final", () => {
    const games = [
      game({ id: "a", week: 1, status: "final" }),
      game({ id: "b", week: 2, status: "final" }),
    ];
    expect(getCurrentWeek(games)).toBe(2);
  });
});

describe("selectUpcomingGames", () => {
  it("sorts by kickoff ascending and caps to count", () => {
    const games = [
      game({ id: "latest", week: 2, status: "scheduled", kickoff: "2026-09-15T00:15:00Z" }),
      game({ id: "earliest", week: 2, status: "live", kickoff: "2026-09-13T17:00:00Z" }),
      game({ id: "middle", week: 2, status: "scheduled", kickoff: "2026-09-13T20:25:00Z" }),
    ];
    expect(selectUpcomingGames(games, 2).map((g) => g.id)).toEqual(["earliest", "middle"]);
  });

  it("returns fewer than count when there aren't enough games", () => {
    const games = [game({ id: "only", week: 2, status: "scheduled" })];
    expect(selectUpcomingGames(games, 3)).toHaveLength(1);
  });

  it("does not mutate the input array", () => {
    const games = [
      game({ id: "b", week: 2, status: "scheduled", kickoff: "2026-09-15T00:15:00Z" }),
      game({ id: "a", week: 2, status: "scheduled", kickoff: "2026-09-13T17:00:00Z" }),
    ];
    const original = [...games];
    selectUpcomingGames(games, 1);
    expect(games).toEqual(original);
  });
});

describe("getSchedule", () => {
  it("falls back to the fixture when the store is empty", () => {
    const result = getSchedule();
    expect(result).toEqual({ games: getScheduleFixture(), isLive: false, updatedAt: null });
  });

  it("returns store games and isLive:true once the store has data", () => {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(
      STORE_PATH,
      JSON.stringify({ games: [LIVE_GAME], updatedAt: "2026-09-13T20:30:00Z", source: "balldontlie" }),
    );

    expect(getSchedule()).toEqual({
      games: [LIVE_GAME],
      isLive: true,
      updatedAt: "2026-09-13T20:30:00Z",
    });
  });
});
