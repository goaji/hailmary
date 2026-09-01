import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { getSchedule, getScheduleFixture } from "./schedule";

// Same path writeScores/readScores default to (utils/store.ts), duplicated
// here rather than exported since only this test needs to reach past the
// public readScores(storePath?) API to exercise getSchedule()'s own default.
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
