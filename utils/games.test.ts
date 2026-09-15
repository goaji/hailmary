import { describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { selectUpcomingGames } from "./games";

function game(overrides: Partial<Game> & Pick<Game, "id" | "week" | "status">): Game {
  return {
    homeTeamId: "kc",
    awayTeamId: "buf",
    kickoff: "2026-09-13T20:25:00Z",
    ...overrides,
  };
}

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

  it("excludes games that have already been played", () => {
    const games = [
      game({ id: "played", week: 2, status: "final", kickoff: "2026-09-13T17:00:00Z" }),
      game({ id: "next", week: 2, status: "scheduled", kickoff: "2026-09-15T00:15:00Z" }),
    ];
    expect(selectUpcomingGames(games, 1).map((g) => g.id)).toEqual(["next"]);
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
