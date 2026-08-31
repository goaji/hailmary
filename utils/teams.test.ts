import { describe, expect, it } from "vitest";
import { DEFAULT_TEAM, getTeam, TEAMS } from "./teams";
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
