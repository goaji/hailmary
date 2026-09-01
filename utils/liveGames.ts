import type { Game } from "@/types";

// No "server-only" tag — this needs to be importable from the client-side
// polling hook (components/schedule/useLiveScores.ts) too.
export function hasLiveGame(games: Game[] | undefined): boolean {
  return games?.some((game) => game.status === "live" || game.status === "halftime") ?? false;
}
