import { describe, expect, it } from "vitest";
import { CONFERENCES, DEFAULT_TEAM, DIVISIONS, getTeam, getTeamsByDivision, TEAMS } from "./teams";
import { contrastRatio } from "./contrast";

// The two dark surfaces accent1/accent2 are calibrated against — see the
// comment at the top of teams.ts. Any team can be selected later even
// though only PICKER_TEAMS is reachable through the current UI, so this
// checks the whole table, not just those six.
const PAGE_BACKGROUND = "#14151a";
const PANEL_BACKGROUND = "#1e2027";

describe("getTeam", () => {
  it("returns the matching team for a known slug", () => {
    const team = getTeam("phi");
    expect(team.slug).toBe("phi");
    expect(team.name).toBe("Philadelphia Eagles");
  });

  it("falls back to the default team for an unknown slug", () => {
    const team = getTeam("not-a-real-team");
    expect(team.slug).toBe(DEFAULT_TEAM);
  });

  it("falls back to the default team for an empty slug", () => {
    const team = getTeam("");
    expect(team.slug).toBe(DEFAULT_TEAM);
  });
});

describe("getTeamsByDivision", () => {
  it("returns exactly four teams for every conference/division pair", () => {
    for (const conference of CONFERENCES) {
      for (const division of DIVISIONS) {
        expect(getTeamsByDivision(conference, division)).toHaveLength(4);
      }
    }
  });

  it("returns only teams matching both the conference and division", () => {
    const afcEast = getTeamsByDivision("AFC", "East");
    expect(afcEast.map((team) => team.slug).sort()).toEqual(["buf", "mia", "ne", "nyj"]);
    for (const team of afcEast) {
      expect(team.conference).toBe("AFC");
      expect(team.division).toBe("East");
    }
  });

  it("covers all 32 teams with no overlap across the 8 groups", () => {
    const grouped = CONFERENCES.flatMap((conference) =>
      DIVISIONS.flatMap((division) => getTeamsByDivision(conference, division)),
    );
    expect(grouped).toHaveLength(TEAMS.length);
    expect(new Set(grouped.map((team) => team.slug)).size).toBe(TEAMS.length);
  });
});

describe("team accent contrast", () => {
  for (const team of TEAMS) {
    it(`${team.name}: accent1 clears 4.5:1 on the page`, () => {
      expect(contrastRatio(team.accent1, PAGE_BACKGROUND)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${team.name}: accent2 clears 4.5:1 on the panel`, () => {
      expect(contrastRatio(team.accent2, PANEL_BACKGROUND)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
