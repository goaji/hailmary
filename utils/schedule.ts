import type { Game } from "@/types";

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
