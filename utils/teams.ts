// Team data, contrast-derived accent colors, and lookup helpers now live in
// @hailmary/shared so hailmary-e2e can import the same source.
export type { Conference, Division, Team } from "@hailmary/shared";
export {
  TEAMS,
  TEAMS_BY_SLUG,
  DEFAULT_TEAM,
  getTeam,
  CONFERENCES,
  DIVISIONS,
  getTeamsByDivision,
  getAdjacentTeams,
  onBrandColor,
  PICKER_TEAMS,
} from "@hailmary/shared";
