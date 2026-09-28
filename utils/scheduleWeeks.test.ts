import { describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { getAvailableWeeks, getCurrentWeek } from "./scheduleWeeks";

function game(overrides: Partial<Game> & Pick<Game, "id" | "week" | "status">): Game {
  return {
    homeTeamId: "kc",
    awayTeamId: "buf",
    kickoff: "2026-09-13T20:25:00Z",
    season: 2026,
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
