import "server-only";

import type { Game } from "@/types";
import { readScores } from "@/utils/store";

// FIXTURE DATA — not a real feed. No MDX, no API; a placeholder until
// live score data is wired up (see AGENTS.md's "Consume live score data"
// recipe, which owns the real utils/scores.ts implementation).
const SCHEDULE_FIXTURE: Game[] = [
  {
    id: "2026-w2-sf-bal",
    homeTeamId: "bal",
    awayTeamId: "sf",
    kickoff: "2026-09-13T17:00:00Z",
    week: 2,
    status: "scheduled",
  },
  {
    id: "2026-w2-det-gb",
    homeTeamId: "gb",
    awayTeamId: "det",
    kickoff: "2026-09-13T20:25:00Z",
    week: 2,
    status: "scheduled",
  },
  {
    id: "2026-w2-buf-mia",
    homeTeamId: "mia",
    awayTeamId: "buf",
    kickoff: "2026-09-15T00:15:00Z",
    week: 2,
    status: "scheduled",
  },
];

export function getScheduleFixture(): Game[] {
  return SCHEDULE_FIXTURE;
}

export type ScheduleResult = {
  games: Game[];
  /** false when the store was empty and this is the fixture instead. */
  isLive: boolean;
  updatedAt: string | null;
};

/** Reads the live score store, falling back to the fixture when it's empty. */
export function getSchedule(): ScheduleResult {
  const store = readScores();
  if (store.games.length === 0) {
    return { games: SCHEDULE_FIXTURE, isLive: false, updatedAt: null };
  }
  return { games: store.games, isLive: true, updatedAt: store.updatedAt };
}

/** Distinct week numbers present in `games`, ascending. */
export function getAvailableWeeks(games: Game[]): number[] {
  return Array.from(new Set(games.map((game) => game.week))).sort((a, b) => a - b);
}

// The earliest week that still has a game not yet final — once every game
// in a week is final, the next week (if any) becomes current automatically.
// Falls back to the latest week once the whole known schedule is final.
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
