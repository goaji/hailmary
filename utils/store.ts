import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { Game } from "@/types";

export type ScoreStoreMeta = {
  /** ISO datetime of the last successful sync, or null if never synced. */
  updatedAt: string | null;
  /** Provider name, e.g. "balldontlie". Absent when the store is empty. */
  source?: string;
  /** ISO datetime of the last sync attempt, success or failure — distinct from `updatedAt` so a run of failures still gets throttled. */
  lastAttemptAt?: string | null;
  /** Whether that last attempt succeeded. Absent/undefined for a legacy store predating this field. */
  lastAttemptOk?: boolean;
};

export type ScoreStore = ScoreStoreMeta & {
  games: Game[];
};

const DEFAULT_STORE_PATH = path.join(process.cwd(), ".data", "scores.json");

const EMPTY_STORE: ScoreStore = { games: [], updatedAt: null };

/** Never throws. A missing or corrupt file reads back as an empty store. */
export function readScores(storePath: string = DEFAULT_STORE_PATH): ScoreStore {
  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray((parsed as ScoreStore).games)
    ) {
      return EMPTY_STORE;
    }
    const { games, updatedAt, source, lastAttemptAt, lastAttemptOk } = parsed as ScoreStore;
    return {
      games,
      updatedAt: updatedAt ?? null,
      source,
      lastAttemptAt: lastAttemptAt ?? null,
      lastAttemptOk,
    };
  } catch {
    return EMPTY_STORE;
  }
}

// Temp-file-then-rename: atomic on the same filesystem, so overlapping writers never interleave into a corrupt file.
export function writeScores(
  games: Game[],
  meta: ScoreStoreMeta,
  storePath: string = DEFAULT_STORE_PATH,
): void {
  const dir = path.dirname(storePath);
  fs.mkdirSync(dir, { recursive: true });

  const store: ScoreStore = {
    games,
    updatedAt: meta.updatedAt,
    source: meta.source,
    lastAttemptAt: meta.lastAttemptAt ?? null,
    lastAttemptOk: meta.lastAttemptOk,
  };
  const tmpPath = path.join(dir, `.${path.basename(storePath)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmpPath, storePath);
}

/** Age of the store in milliseconds, or null when it has never been synced. */
export function scoreStoreAgeMs(updatedAt: string | null, now: Date = new Date()): number | null {
  if (!updatedAt) {
    return null;
  }
  return now.getTime() - new Date(updatedAt).getTime();
}

/** Whether a sync attempt should be skipped: throttles on the last attempt (not just the last success), and applies a longer gap after a failure so a provider outage/rate-limit isn't retried at full speed. */
export function shouldSkipSync(
  meta: Pick<ScoreStoreMeta, "lastAttemptAt" | "lastAttemptOk">,
  minSuccessIntervalMs: number,
  minRetryIntervalMs: number,
  now: Date = new Date(),
): boolean {
  if (!meta.lastAttemptAt) {
    return false;
  }
  const sinceLastAttempt = now.getTime() - new Date(meta.lastAttemptAt).getTime();
  const requiredGap = meta.lastAttemptOk === false ? minRetryIntervalMs : minSuccessIntervalMs;
  return sinceLastAttempt < requiredGap;
}
