import { describe, expect, it } from "vitest";
import { HEADER_BG, PAGE_BG, TEAM_TINT_PERCENT, teamSurfaceVars, tintSurface } from "./theme";
import { contrastRatio } from "./contrast";
import { TEAMS } from "./teams";

const TEXT = "#f5f4f2";
const TEXT_MUTED = "#9a9ba3";

function relativeLuminance(hex: string): number {
  const channels = [0, 1, 2].map((i) => {
    const c = parseInt(hex.replace("#", "").slice(i * 2, i * 2 + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

describe("tintSurface", () => {
  it("leaves the surface untouched at 0%", () => {
    expect(tintSurface(PAGE_BG, "#e8405a", 0)).toBe(PAGE_BG);
  });

  it("shifts the surface toward the accent's hue", () => {
    // The Chiefs' red accent must leave more red in the page than it started with.
    const tinted = tintSurface(PAGE_BG, "#e8405a");
    expect(tinted).not.toBe(PAGE_BG);
    expect(parseInt(tinted.slice(1, 3), 16)).toBeGreaterThan(parseInt(PAGE_BG.slice(1, 3), 16));
  });

  it("falls back to the untinted surface for a pure black accent", () => {
    expect(tintSurface(PAGE_BG, "#000000")).toBe(PAGE_BG);
  });

  // The whole point of the luminance-preserving mix: every existing contrast
  // guarantee is stated against the base surface, and stays true after tinting.
  for (const team of TEAMS) {
    it(`${team.name}: holds the page and header luminance`, () => {
      for (const base of [PAGE_BG, HEADER_BG]) {
        const tinted = tintSurface(base, team.accent1);
        expect(relativeLuminance(tinted)).toBeCloseTo(relativeLuminance(base), 3);
      }
    });
  }
});

describe("tinted page contrast", () => {
  for (const team of TEAMS) {
    const page = tintSurface(PAGE_BG, team.accent1);

    it(`${team.name}: accent1 clears 4.5:1 on its own tinted page`, () => {
      expect(contrastRatio(team.accent1, page)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${team.name}: body and muted text clear 4.5:1 on the tinted page`, () => {
      expect(contrastRatio(TEXT, page)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(TEXT_MUTED, page)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("teamSurfaceVars", () => {
  it("returns both surfaces tinted at the shared strength", () => {
    const accent = "#1e9ba8";
    expect(teamSurfaceVars(accent)).toEqual({
      "--c-page": tintSurface(PAGE_BG, accent, TEAM_TINT_PERCENT),
      "--c-header": tintSurface(HEADER_BG, accent, TEAM_TINT_PERCENT),
    });
  });
});
