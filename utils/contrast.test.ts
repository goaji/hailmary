import { describe, expect, it } from "vitest";
import { contrastRatio, meetsContrast } from "./contrast";

describe("contrastRatio", () => {
  it("black on white is the maximum, 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("a color against itself is 1:1", () => {
    expect(contrastRatio("#e8405a", "#e8405a")).toBeCloseTo(1, 5);
  });

  it("is symmetric regardless of argument order", () => {
    expect(contrastRatio("#14151a", "#ffb612")).toBeCloseTo(contrastRatio("#ffb612", "#14151a"), 5);
  });
});

describe("meetsContrast", () => {
  it("passes when the ratio clears the bar", () => {
    expect(meetsContrast("#000000", "#ffffff", 4.5)).toBe(true);
  });

  it("fails when the ratio falls short", () => {
    expect(meetsContrast("#14151a", "#191b21", 4.5)).toBe(false);
  });
});
