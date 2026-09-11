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
export function getSchedule(): ScheduleResult {
  const store = readScores();
  if (store.games.length === 0) {
    return { games: [], isLive: false, updatedAt: null };
  }
  return { games: store.games, isLive: true, updatedAt: store.updatedAt };
}

/** Distinct week numbers present in `games`, ascending. */
export function getAvailableWeeks(games: Game[]): number[] {
  return Array.from(new Set(games.map((game) => game.week))).sort((a, b) => a - b);
}

// Earliest week with a non-final game; falls back to the latest week once everything is final.
export function getCurrentWeek(games: Game[]): number {
  if (games.length === 0) {
    return 1;
  }
  const unresolved = games.filter((game) => game.status !== "final");
  if (unresolved.length > 0) {
    return Math.min(...unresolved.map((game) => game.week));
  }
  return Math.max(...games.map((game) => game.week));
}

// Soonest-kickoff-first, capped to `count` — for compact surfaces (homepage panel) that only have room for a handful of rows. Live/just-started games sort first since their kickoff has already passed.
export function selectUpcomingGames(games: Game[], count: number): Game[] {
  return [...games]
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, count);
}
