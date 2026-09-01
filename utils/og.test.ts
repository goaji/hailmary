import { describe, expect, it } from "vitest";
import { truncateForOg } from "./og";

describe("truncateForOg", () => {
  it("returns short text unchanged", () => {
    expect(truncateForOg("Titlu scurt", 60)).toBe("Titlu scurt");
  });

  it("returns text unchanged when exactly at the limit", () => {
    const text = "a".repeat(60);
    expect(truncateForOg(text, 60)).toBe(text);
  });

  it("breaks on the last word boundary and appends an ellipsis", () => {
    const text = "Chiefs câștigă al treilea titlu consecutiv după un meci dramatic";
    const result = truncateForOg(text, 40);

    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(41);
    expect(text.startsWith(result.slice(0, -1))).toBe(true);
    // The cut word itself must not appear truncated mid-word.
    expect(result.slice(0, -1).endsWith(" ")).toBe(false);
  });

  it("falls back to a hard cut when there's no word boundary to break on", () => {
    const text = "a".repeat(80);
    expect(truncateForOg(text, 40)).toBe(`${"a".repeat(40)}…`);
  });
});
