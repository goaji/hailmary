import { describe, expect, it } from "vitest";
import { formatKickoff } from "./formatKickoff";

describe("formatKickoff", () => {
  it("formats in Bucharest local time regardless of a US UTC offset", () => {
    // 1pm ET (UTC-4 in September) is 8pm Bucharest time (UTC+3 in September).
    expect(formatKickoff("2026-09-13T17:00:00Z", "ro")).toBe("dum. 20:00");
  });

  it("crosses the day boundary correctly for a late US kickoff", () => {
    // Monday 8:15pm ET is already Tuesday 3:15am in Bucharest.
    expect(formatKickoff("2026-09-15T00:15:00Z", "ro")).toBe("mar. 03:15");
  });

  it("formats in English when given the en locale", () => {
    expect(formatKickoff("2026-09-13T17:00:00Z", "en")).toBe("Sun 08:00 PM");
  });
});
