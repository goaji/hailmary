import type { Game } from "@/types";

// No "server-only" tag — this needs to be importable from the client-side
// polling hook (components/schedule/useLiveScores.ts) too.
export function isLiveStatus(status: Game["status"]): boolean {
  return status === "live" || status === "halftime";
}

export function hasGameScore(game: Pick<Game, "homeScore" | "awayScore">): boolean {
  return typeof game.homeScore === "number" && typeof game.awayScore === "number";
}

export function hasLiveGame(games: Game[] | undefined): boolean {
  return games?.some((game) => isLiveStatus(game.status)) ?? false;
}
