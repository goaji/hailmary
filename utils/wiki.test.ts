import { describe, expect, it } from "vitest";
import type { WikiPage } from "@/types";
import {
  computePrevNext,
  groupPagesByStrand,
  isWikiStrandId,
  parseWikiFrontmatter,
  validateUniqueOrder,
  wikiFilePath,
} from "./wiki";

const validFrontmatter = {
  title: "Sistemul de down-uri",
  description: "Ce e un down, cele 10 yarzi, și decizia de 4th down.",
  strand: "the-game",
  order: 20,
  shape: "parent",
  sections: [
    { id: "ce-este-un-down", title: "Ce este un down" },
    { id: "cele-10-yarzi", title: "Cele 10 yarzi" },
  ],
};

function makePage(overrides: Partial<WikiPage["frontmatter"]> & { slug: string }): WikiPage {
  const { slug, ...frontmatterOverrides } = overrides;
  return {
    slug,
    content: "",
    sections: [],
    frontmatter: {
      title: slug,
      description: "d",
      strand: "the-game",
      order: 0,
      shape: "flat",
      sections: [{ id: "x", title: "X", level: 2 }],
      ...frontmatterOverrides,
    },
  };
}

describe("parseWikiFrontmatter", () => {
  it("accepts a valid parent-shape file", () => {
    const result = parseWikiFrontmatter(validFrontmatter, "test.mdx");

    expect(result.strand).toBe("the-game");
    expect(result.shape).toBe("parent");
    expect(result.sections).toHaveLength(2);
  });

  it("accepts optional timeline entries", () => {
    const result = parseWikiFrontmatter(
      {
        ...validFrontmatter,
        shape: "parent",
        sections: [{ id: "origini", title: "Origini" }],
        entries: [{ year: "1920", title: "Se înființează liga", body: "Text.", era: "origini" }],
      },
      "test.mdx",
    );

    expect(result.entries).toHaveLength(1);
  });

  it("rejects an unknown strand, naming the file and field", () => {
    expect(() =>
      parseWikiFrontmatter({ ...validFrontmatter, strand: "not-a-strand" }, "content/wiki/ro/x/y.mdx"),
    ).toThrow('content/wiki/ro/x/y.mdx: field "strand"');
  });

  it("rejects an unknown shape", () => {
    expect(() => parseWikiFrontmatter({ ...validFrontmatter, shape: "nested" }, "test.mdx")).toThrow(
      '"shape"',
    );
  });

  it("rejects a non-positive order", () => {
    expect(() => parseWikiFrontmatter({ ...validFrontmatter, order: 0 }, "test.mdx")).toThrow('"order"');
  });
});

describe("isWikiStrandId", () => {
  it("accepts every declared strand id", () => {
    expect(isWikiStrandId("the-game")).toBe(true);
    expect(isWikiStrandId("istorie")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isWikiStrandId("regulament")).toBe(false);
    expect(isWikiStrandId("")).toBe(false);
  });
});

describe("wikiFilePath", () => {
  it("nests locale/strand/slug.mdx under content/wiki", () => {
    expect(wikiFilePath("ro", "the-game", "sistemul-de-downuri")).toBe(
      `${process.cwd()}/content/wiki/ro/the-game/sistemul-de-downuri.mdx`,
    );
  });
});

describe("groupPagesByStrand", () => {
  it("buckets pages under their strand, in WIKI_STRAND_IDS order, sorted by frontmatter.order", () => {
    const pages = [
      makePage({ slug: "b", strand: "the-game", order: 20 }),
      makePage({ slug: "a", strand: "the-game", order: 10 }),
      makePage({ slug: "c", strand: "istorie", order: 10 }),
    ];

    const groups = groupPagesByStrand(pages);

    expect(groups.map((g) => g.strand)).toEqual(["the-game", "chess-match", "the-league", "the-numbers", "istorie"]);
    expect(groups[0].pages.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(groups[4].pages.map((p) => p.slug)).toEqual(["c"]);
  });

  it("returns an empty pages array for a strand with no pages", () => {
    const groups = groupPagesByStrand([]);
    expect(groups.every((g) => g.pages.length === 0)).toBe(true);
  });
});

describe("validateUniqueOrder", () => {
  it("passes silently when every page in a strand has a distinct order", () => {
    const pages = [makePage({ slug: "a", order: 10 }), makePage({ slug: "b", order: 20 })];
    expect(() => validateUniqueOrder("the-game", pages)).not.toThrow();
  });

  it("throws naming both slugs and the shared order", () => {
    const pages = [makePage({ slug: "a", order: 10 }), makePage({ slug: "b", order: 10 })];
    expect(() => validateUniqueOrder("the-game", pages)).toThrow(
      'Wiki strand "the-game": pages "a" and "b" both declare order 10',
    );
  });
});

describe("computePrevNext", () => {
  const strandPages = [
    makePage({ slug: "a", order: 10 }),
    makePage({ slug: "b", order: 20 }),
    makePage({ slug: "c", order: 30 }),
  ];

  it("returns both neighbours for a page in the middle", () => {
    const result = computePrevNext(strandPages, "b");
    expect(result.prev?.slug).toBe("a");
    expect(result.next?.slug).toBe("c");
  });

  it("omits prev for the first page and next for the last", () => {
    expect(computePrevNext(strandPages, "a").prev).toBeUndefined();
    expect(computePrevNext(strandPages, "c").next).toBeUndefined();
  });

  it("returns an empty object for a slug not in the list", () => {
    expect(computePrevNext(strandPages, "missing")).toEqual({});
  });
});
