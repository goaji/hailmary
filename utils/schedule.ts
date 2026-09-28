import "server-only";

import type { Game } from "@/types";
import { readScores } from "@/utils/store";

export type ScheduleResult = {
  games: Game[];
  /** false when the store is empty — no real schedule data synced yet. */
  isLive: boolean;
  updatedAt: string | null;
};

/** Reads the live score store. Empty until the cron route has synced at least once. */
export function getSchedule(storePath?: string): ScheduleResult {
  const store = readScores(storePath);
  if (store.games.length === 0) {
    return { games: [], isLive: false, updatedAt: null };
  }
  return { games: store.games, isLive: true, updatedAt: store.updatedAt };
}
