import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { latestMtime, resolveLastModified } from "./sitemap";

describe("resolveLastModified", () => {
  it("parses a valid ISO string", () => {
    expect(resolveLastModified("2026-08-24", new Date(0))).toEqual(
      new Date("2026-08-24"),
    );
  });

  it("falls back to the given Date when there's no ISO string", () => {
    const fallback = new Date("2020-01-01");
    expect(resolveLastModified(null, fallback)).toBe(fallback);
    expect(resolveLastModified(undefined, fallback)).toBe(fallback);
  });
});

describe("latestMtime", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-mtime-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns the mtime of a single file", () => {
    const filePath = path.join(dir, "a.mdx");
    fs.writeFileSync(filePath, "a");
    expect(latestMtime([filePath])).toEqual(fs.statSync(filePath).mtime);
  });

  it("returns the newest mtime among several files", () => {
    const older = path.join(dir, "older.mdx");
    const newer = path.join(dir, "newer.mdx");
    fs.writeFileSync(older, "old");
    fs.writeFileSync(newer, "new");

    const olderTime = new Date("2020-01-01");
    const newerTime = new Date("2026-01-01");
    fs.utimesSync(older, olderTime, olderTime);
    fs.utimesSync(newer, newerTime, newerTime);

    expect(latestMtime([older, newer])).toEqual(newerTime);
    expect(latestMtime([newer, older])).toEqual(newerTime);
  });

  it("returns the epoch for an empty file list", () => {
    expect(latestMtime([])).toEqual(new Date(0));
  });
});
