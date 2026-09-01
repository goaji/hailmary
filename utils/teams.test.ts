import { describe, expect, it } from "vitest";
import {
  CONFERENCES,
  DEFAULT_TEAM,
  DIVISIONS,
  getAdjacentTeams,
  getTeam,
  getTeamsByDivision,
  onBrandColor,
  TEAMS,
} from "./teams";
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

describe("getAdjacentTeams", () => {
  it("returns the previous and next team in TEAMS order", () => {
    // AFC North is bal, cin, cle, pit — cin sits between bal and cle.
    const { previous, next } = getAdjacentTeams("cin");
    expect(previous?.slug).toBe("bal");
    expect(next?.slug).toBe("cle");
  });

  it("has no previous team for the first team in the list", () => {
    const { previous, next } = getAdjacentTeams(TEAMS[0].slug);
    expect(previous).toBeUndefined();
    expect(next?.slug).toBe(TEAMS[1].slug);
  });

  it("has no next team for the last team in the list", () => {
    const { previous, next } = getAdjacentTeams(TEAMS[TEAMS.length - 1].slug);
    expect(next).toBeUndefined();
    expect(previous?.slug).toBe(TEAMS[TEAMS.length - 2].slug);
  });

  it("returns neither for an unknown slug", () => {
    expect(getAdjacentTeams("not-a-real-team")).toEqual({});
  });
});

describe("onBrandColor", () => {
  // Table-driven over the whole TEAMS list, not a hand-picked sample — this
  // is exactly what step 1's "hard constraint" (brand1 has no contrast
  // guarantee against either surface) needs proving for all 32, including
  // the three that fail both $c-text and $c-page and fall back to true
  // white/black (Chiefs, Chargers, Lions).
  for (const team of TEAMS) {
    it(`${team.name}: clears 4.5:1 against its own brand1`, () => {
      expect(contrastRatio(team.brand1, onBrandColor(team))).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("returns one of the four known foreground colors, never brand1/brand2 themselves", () => {
    const allowed = new Set(["#f5f4f2", "#14151a", "#ffffff", "#000000"]);
    for (const team of TEAMS) {
      expect(allowed.has(onBrandColor(team))).toBe(true);
    }
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
