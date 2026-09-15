import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { getAvailableWeeks, getCurrentWeek, getSchedule } from "./schedule";

// A real temp dir, never the project's own .data/scores.json — that file is
// live dev/prod data (or a developer's manual test fixture), and this test
// used to delete it for real on every run. getSchedule() takes an optional
// storePath specifically so this can stay isolated the same way store.test.ts is.
let dir: string;
let storePath: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "schedule-store-"));
  storePath = path.join(dir, "scores.json");
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

const LIVE_GAME: Game = {
  id: "2026-w2-kc-buf",
  homeTeamId: "kc",
  awayTeamId: "buf",
  kickoff: "2026-09-13T20:25:00Z",
  week: 2,
  status: "live",
};

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


describe("getSchedule", () => {
  it("returns an empty schedule when the store is empty", () => {
    const result = getSchedule(storePath);
    expect(result).toEqual({ games: [], isLive: false, updatedAt: null });
  });

  it("returns store games and isLive:true once the store has data", () => {
    fs.writeFileSync(
      storePath,
      JSON.stringify({ games: [LIVE_GAME], updatedAt: "2026-09-13T20:30:00Z", source: "balldontlie" }),
    );

    expect(getSchedule(storePath)).toEqual({
      games: [LIVE_GAME],
      isLive: true,
      updatedAt: "2026-09-13T20:30:00Z",
    });
  });
});
