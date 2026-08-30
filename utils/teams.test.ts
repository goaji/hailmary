import { describe, expect, it } from "vitest";
import { DEFAULT_TEAM, getTeam } from "./teams";

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
