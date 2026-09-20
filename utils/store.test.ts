import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Game } from "@/types";
import { readScores, scoreStoreAgeMs, shouldSkipSync, writeScores } from "./store";

const SAMPLE_GAME: Game = {
  id: "2026-w2-kc-buf",
  homeTeamId: "kc",
  awayTeamId: "buf",
  kickoff: "2026-09-13T20:25:00Z",
  season: 2026,
  week: 2,
  status: "live",
  homeScore: 14,
  awayScore: 10,
};

let dir: string;
let storePath: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "scores-store-"));
  storePath = path.join(dir, "scores.json");
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("readScores", () => {
  it("returns an empty store when the file doesn't exist", () => {
    expect(readScores(storePath)).toEqual({ games: [], updatedAt: null });
  });

  it("returns an empty store for corrupt JSON rather than throwing", () => {
    fs.writeFileSync(storePath, "{not valid json", "utf-8");
    expect(readScores(storePath)).toEqual({ games: [], updatedAt: null });
  });

  it("returns an empty store when the file is valid JSON but the wrong shape", () => {
    fs.writeFileSync(storePath, JSON.stringify({ oops: true }), "utf-8");
    expect(readScores(storePath)).toEqual({ games: [], updatedAt: null });
  });

  it("round-trips games and meta written by writeScores", () => {
    writeScores(
      [SAMPLE_GAME],
      { updatedAt: "2026-09-13T20:30:00Z", source: "balldontlie" },
      storePath,
    );
    expect(readScores(storePath)).toEqual({
      games: [SAMPLE_GAME],
      updatedAt: "2026-09-13T20:30:00Z",
      source: "balldontlie",
      lastAttemptAt: null,
    });
  });

  it("round-trips a failed-attempt marker without touching games or updatedAt", () => {
    writeScores(
      [SAMPLE_GAME],
      { updatedAt: "2026-09-13T20:30:00Z", source: "balldontlie" },
      storePath,
    );
    const existing = readScores(storePath);
    writeScores(
      existing.games,
      { ...existing, lastAttemptAt: "2026-09-13T20:31:00Z", lastAttemptOk: false },
      storePath,
    );
    expect(readScores(storePath)).toEqual({
      games: [SAMPLE_GAME],
      updatedAt: "2026-09-13T20:30:00Z",
      source: "balldontlie",
      lastAttemptAt: "2026-09-13T20:31:00Z",
      lastAttemptOk: false,
    });
  });
});

describe("writeScores", () => {
  it("creates the parent directory when it doesn't exist yet", () => {
    const nestedPath = path.join(dir, "nested", "scores.json");
    writeScores([], { updatedAt: null }, nestedPath);
    expect(readScores(nestedPath)).toEqual({ games: [], updatedAt: null, lastAttemptAt: null });
  });

  it("leaves no leftover temp file behind", () => {
    writeScores([SAMPLE_GAME], { updatedAt: "2026-09-13T20:30:00Z" }, storePath);
    expect(fs.readdirSync(dir)).toEqual(["scores.json"]);
  });

  it("a second write fully replaces the first, never merging or interleaving", () => {
    writeScores([SAMPLE_GAME], { updatedAt: "2026-09-13T20:30:00Z" }, storePath);
    writeScores([], { updatedAt: "2026-09-13T20:31:00Z", source: "balldontlie" }, storePath);
    expect(readScores(storePath)).toEqual({
      games: [],
      updatedAt: "2026-09-13T20:31:00Z",
      source: "balldontlie",
      lastAttemptAt: null,
    });
  });
});

describe("scoreStoreAgeMs", () => {
  it("returns null when the store has never been synced", () => {
    expect(scoreStoreAgeMs(null)).toBeNull();
  });

  it("returns the elapsed milliseconds since updatedAt", () => {
    const now = new Date("2026-09-13T20:35:00Z");
    expect(scoreStoreAgeMs("2026-09-13T20:30:00Z", now)).toBe(5 * 60 * 1000);
  });
});

describe("shouldSkipSync", () => {
  const MIN_SUCCESS_MS = 30_000;
  const MIN_RETRY_MS = 5 * 60_000;

  it("never skips when there has been no prior attempt", () => {
    expect(shouldSkipSync({ lastAttemptAt: null }, MIN_SUCCESS_MS, MIN_RETRY_MS)).toBe(false);
  });

  it("skips a successful attempt within the short success interval", () => {
    const now = new Date("2026-09-13T20:30:20Z");
    const meta = { lastAttemptAt: "2026-09-13T20:30:00Z", lastAttemptOk: true };
    expect(shouldSkipSync(meta, MIN_SUCCESS_MS, MIN_RETRY_MS, now)).toBe(true);
  });

  it("does not skip a successful attempt once the success interval has passed", () => {
    const now = new Date("2026-09-13T20:30:31Z");
    const meta = { lastAttemptAt: "2026-09-13T20:30:00Z", lastAttemptOk: true };
    expect(shouldSkipSync(meta, MIN_SUCCESS_MS, MIN_RETRY_MS, now)).toBe(false);
  });

  it("still skips a failed attempt after the short success interval — the point of the retry backoff", () => {
    const now = new Date("2026-09-13T20:30:31Z");
    const meta = { lastAttemptAt: "2026-09-13T20:30:00Z", lastAttemptOk: false };
    expect(shouldSkipSync(meta, MIN_SUCCESS_MS, MIN_RETRY_MS, now)).toBe(true);
  });

  it("stops skipping a failed attempt once the longer retry interval has passed", () => {
    const now = new Date("2026-09-13T20:35:01Z");
    const meta = { lastAttemptAt: "2026-09-13T20:30:00Z", lastAttemptOk: false };
    expect(shouldSkipSync(meta, MIN_SUCCESS_MS, MIN_RETRY_MS, now)).toBe(false);
  });
});
