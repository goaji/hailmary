import { describe, expect, it } from "vitest";
import { formatPublishedAt } from "./formatPublishedAt";

const NOW = new Date("2026-08-24T12:00:00Z").getTime();

function hoursBeforeNow(hours: number): string {
  return new Date(NOW - hours * 3_600_000).toISOString();
}

describe("formatPublishedAt", () => {
  it("formats minutes for anything under an hour", () => {
    const publishedAt = new Date(NOW - 5 * 60_000).toISOString();
    expect(formatPublishedAt(publishedAt, "ro", NOW)).toBe("acum 5 minute");
  });

  it("formats hours for anything under a day", () => {
    expect(formatPublishedAt(hoursBeforeNow(2), "ro", NOW)).toBe("acum 2 ore");
    expect(formatPublishedAt(hoursBeforeNow(9), "ro", NOW)).toBe("acum 9 ore");
  });

  it("formats days between the 24h and 48h boundary", () => {
    expect(formatPublishedAt(hoursBeforeNow(30), "ro", NOW)).toBe("ieri");
  });

  it("falls back to an absolute date above the 48h threshold", () => {
    expect(formatPublishedAt(hoursBeforeNow(72), "ro", NOW)).toBe("21 aug.");
  });

  it("formats in English when given the en locale", () => {
    expect(formatPublishedAt(hoursBeforeNow(2), "en", NOW)).toBe("2 hours ago");
  });
});
