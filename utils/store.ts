import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { Game } from "@/types";

export type ScoreStoreMeta = {
  /** ISO datetime of the last successful sync, or null if never synced. */
  updatedAt: string | null;
  /** Provider name, e.g. "balldontlie". Absent when the store is empty. */
  source?: string;
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
    const { games, updatedAt, source } = parsed as ScoreStore;
    return { games, updatedAt: updatedAt ?? null, source };
  } catch {
    return EMPTY_STORE;
  }
}

// Temp-file-then-rename: a rename is atomic on the same filesystem, so a
// reader never observes a half-written file, and two overlapping writers
// each finish with a complete file (last rename wins) rather than
// interleaved bytes.
export function writeScores(
  games: Game[],
  meta: ScoreStoreMeta,
  storePath: string = DEFAULT_STORE_PATH,
): void {
  const dir = path.dirname(storePath);
  fs.mkdirSync(dir, { recursive: true });

  const store: ScoreStore = { games, updatedAt: meta.updatedAt, source: meta.source };
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
