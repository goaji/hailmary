import { describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { hasLiveGame } from "./liveGames";

function game(status: Game["status"]): Game {
  return {
    id: status,
    homeTeamId: "kc",
    awayTeamId: "buf",
    kickoff: "2026-09-13T20:25:00Z",
    week: 2,
    status,
  };
}

describe("hasLiveGame", () => {
  it("returns true when a game is live", () => {
    expect(hasLiveGame([game("scheduled"), game("live")])).toBe(true);
  });

  it("returns true when a game is at halftime", () => {
    expect(hasLiveGame([game("halftime")])).toBe(true);
  });

  it("returns false when every game is final, scheduled or postponed", () => {
    expect(hasLiveGame([game("final"), game("scheduled"), game("postponed")])).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(hasLiveGame([])).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasLiveGame(undefined)).toBe(false);
  });
});
