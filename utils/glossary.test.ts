import { describe, expect, it } from "vitest";
import {
  parseGlossaryFrontmatter,
  resolveServedLocale,
  sortByTerm,
} from "./glossary";

const validFrontmatter = {
  slug: "blitz",
  term: "Blitz",
  shortDef: "Un atac cu mai mulți jucători decât de obicei asupra quarterback-ului.",
  category: "reguli",
};

describe("parseGlossaryFrontmatter", () => {
  it("accepts a valid file", () => {
    expect(parseGlossaryFrontmatter(validFrontmatter, "test.mdx")).toEqual(
      validFrontmatter,
    );
  });

  it("rejects a file missing a required field, naming the file and the field", () => {
    const { term, ...missingTerm } = validFrontmatter;
    void term;

    expect(() =>
      parseGlossaryFrontmatter(missingTerm, "content/glossary/ro/x.mdx"),
    ).toThrow('content/glossary/ro/x.mdx: field "term"');
  });

  it("rejects a file with an unknown category", () => {
    expect(() =>
      parseGlossaryFrontmatter(
        { ...validFrontmatter, category: "not-a-real-category" },
        "test.mdx",
      ),
    ).toThrow(/"category"/);
  });
});

describe("sortByTerm", () => {
  it("sorts alphabetically with Romanian collation", () => {
    const sorted = sortByTerm([
      { term: "Touchdown" },
      { term: "Blitz" },
      { term: "Întoarcere" },
      { term: "Down" },
    ]);

    expect(sorted.map((e) => e.term)).toEqual([
      "Blitz",
      "Down",
      "Întoarcere",
      "Touchdown",
    ]);
  });
});

describe("resolveServedLocale", () => {
  it("uses the requested locale when a translation exists", () => {
    expect(resolveServedLocale("en", ["ro", "en"])).toBe("en");
  });

  it("falls back to ro when the requested locale has no translation", () => {
    expect(resolveServedLocale("en", ["ro"])).toBe("ro");
  });

  it("returns undefined when the term doesn't exist in any locale", () => {
    expect(resolveServedLocale("en", [])).toBeUndefined();
  });
});
