import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { getSchedule } from "./schedule";

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
  season: 2026,
  week: 2,
  status: "live",
};

describe("getSchedule", () => {
  it("returns an empty schedule when the store is empty", () => {
    const result = getSchedule(storePath);
    expect(result).toEqual({ games: [], isLive: false, updatedAt: null });
  });

  it("returns store games and isLive:true once the store has data", () => {
    fs.writeFileSync(
      storePath,
      JSON.stringify({
        games: [LIVE_GAME],
        updatedAt: "2026-09-13T20:30:00Z",
        source: "balldontlie",
      }),
    );

    expect(getSchedule(storePath)).toEqual({
      games: [LIVE_GAME],
      isLive: true,
      updatedAt: "2026-09-13T20:30:00Z",
    });
  });
});
