import { describe, expect, it } from "vitest";
import {
  extractTermLinkSlugs,
  parseGlossaryFrontmatter,
  sortByTerm,
  validateTermLinks,
} from "./glossary";

const validFrontmatter = {
  slug: "blitz",
  term: "Blitz",
  short: "Un atac cu mai mulți jucători decât de obicei asupra quarterback-ului.",
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

describe("extractTermLinkSlugs", () => {
  it("collects every term slug referenced in the content", () => {
    const content = `Un <TermLink term="play-action">play action</TermLink> urmat de un <TermLink term="blitz">blitz</TermLink>.`;

    expect(extractTermLinkSlugs(content)).toEqual(["play-action", "blitz"]);
  });

  it("returns an empty array when no TermLink is present", () => {
    expect(extractTermLinkSlugs("Text simplu, fără termeni.")).toEqual([]);
  });
});

describe("validateTermLinks", () => {
  it("passes silently when every referenced slug is known", () => {
    const content = `<TermLink term="blitz">blitz</TermLink>`;

    expect(() => validateTermLinks(content, ["blitz"], "test.mdx")).not.toThrow();
  });

  it("throws naming the file and the unknown slug", () => {
    const content = `<TermLink term="not-a-real-term">acesta</TermLink>`;

    expect(() =>
      validateTermLinks(content, ["blitz"], "content/articles/ro/x.mdx"),
    ).toThrow(
      'Unknown glossary term "not-a-real-term" referenced by <TermLink> in content/articles/ro/x.mdx',
    );
  });
});
