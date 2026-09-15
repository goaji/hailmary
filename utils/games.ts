import type { Game } from "@/types";

// No "server-only" tag — this needs to be importable from client components
// (e.g. the homepage's upcoming-games panel, which fetches via useLiveScores).

// Soonest-kickoff-first, capped to `count` — for compact surfaces (homepage panel) that only have room for a handful of rows. Live/just-started games sort first since their kickoff has already passed.
export function selectUpcomingGames(games: Game[], count: number): Game[] {
  return [...games]
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, count);
}
