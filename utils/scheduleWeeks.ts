import type { Game } from "@/types";

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
