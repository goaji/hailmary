import { describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { hasGameScore, hasLiveGame, isLiveStatus } from "./liveGames";

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

describe("isLiveStatus", () => {
  it("is true for live and halftime", () => {
    expect(isLiveStatus("live")).toBe(true);
    expect(isLiveStatus("halftime")).toBe(true);
  });

  it("is false for scheduled, final and postponed", () => {
    expect(isLiveStatus("scheduled")).toBe(false);
    expect(isLiveStatus("final")).toBe(false);
    expect(isLiveStatus("postponed")).toBe(false);
  });
});

describe("hasGameScore", () => {
  it("is true when both scores are numbers", () => {
    expect(hasGameScore({ homeScore: 10, awayScore: 7 })).toBe(true);
  });

  it("is false when either score is missing", () => {
    expect(hasGameScore({ homeScore: 10, awayScore: undefined })).toBe(false);
    expect(hasGameScore({ homeScore: undefined, awayScore: undefined })).toBe(false);
  });
});
