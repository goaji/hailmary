import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { contentFilePath, listMdxSlugs, parseFrontmatter, resolveServedLocale } from "./content";

describe("contentFilePath", () => {
  it("joins baseDir, locale and slug into a .mdx path", () => {
    expect(contentFilePath("/content/articles", "ro", "un-articol")).toBe(
      path.join("/content/articles", "ro", "un-articol.mdx"),
    );
  });
});

describe("listMdxSlugs", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns slugs for every .mdx file in baseDir/locale", () => {
    const localeDir = path.join(tmpDir, "ro");
    fs.mkdirSync(localeDir);
    fs.writeFileSync(path.join(localeDir, "a.mdx"), "");
    fs.writeFileSync(path.join(localeDir, "b.mdx"), "");
    fs.writeFileSync(path.join(localeDir, "notes.txt"), "");

    expect(listMdxSlugs(tmpDir, "ro").sort()).toEqual(["a", "b"]);
  });

  it("returns an empty array when the locale directory doesn't exist", () => {
    expect(listMdxSlugs(tmpDir, "en")).toEqual([]);
  });
});

describe("resolveServedLocale", () => {
  it("uses the requested locale when a translation exists", () => {
    expect(resolveServedLocale("en", ["ro", "en"])).toBe("en");
  });

  it("falls back to ro when the requested locale has no translation", () => {
    expect(resolveServedLocale("en", ["ro"])).toBe("ro");
  });

  it("returns undefined when nothing exists in any locale", () => {
    expect(resolveServedLocale("en", [])).toBeUndefined();
  });
});

describe("parseFrontmatter", () => {
  const schema = z.object({ title: z.string() });

  it("returns the parsed data on success", () => {
    expect(parseFrontmatter(schema, { title: "Titlu" }, "test.mdx")).toEqual({
      title: "Titlu",
    });
  });

  it("throws naming the file path and the offending field on failure", () => {
    expect(() => parseFrontmatter(schema, {}, "content/articles/ro/x.mdx")).toThrow(
      'content/articles/ro/x.mdx: field "title"',
    );
  });
});
