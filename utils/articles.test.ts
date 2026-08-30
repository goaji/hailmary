import { describe, expect, it } from "vitest";
import {
  parseArticleFrontmatter,
  resolveServedLocale,
  selectFeatured,
  sortByPublishedAtDesc,
} from "./articles";

const validFrontmatter = {
  title: "Titlu articol",
  slug: "titlu-articol",
  excerpt: "Un excerpt scurt.",
  category: "analiza",
  publishedAt: "2026-08-24",
  author: "Autor Nume",
  image: { src: "/images/x.jpg", alt: "Descriere imagine" },
};

describe("parseArticleFrontmatter", () => {
  it("accepts a valid file", () => {
    expect(parseArticleFrontmatter(validFrontmatter, "test.mdx")).toEqual(
      validFrontmatter,
    );
  });

  it("rejects a file missing a required field, naming the file and the field", () => {
    const { title, ...missingTitle } = validFrontmatter;
    void title;

    expect(() =>
      parseArticleFrontmatter(missingTitle, "content/articles/ro/x.mdx"),
    ).toThrow('content/articles/ro/x.mdx: field "title"');
  });

  it("rejects a file with an unknown category", () => {
    expect(() =>
      parseArticleFrontmatter(
        { ...validFrontmatter, category: "not-a-real-category" },
        "test.mdx",
      ),
    ).toThrow(/"category"/);
  });
});

describe("sortByPublishedAtDesc", () => {
  it("sorts newest first", () => {
    const sorted = sortByPublishedAtDesc([
      { publishedAt: "2026-01-01" },
      { publishedAt: "2026-06-01" },
      { publishedAt: "2026-03-01" },
    ]);

    expect(sorted.map((a) => a.publishedAt)).toEqual([
      "2026-06-01",
      "2026-03-01",
      "2026-01-01",
    ]);
  });
});

describe("selectFeatured", () => {
  it("picks the featured article even when it isn't newest", () => {
    const sorted = [
      { id: "newest", publishedAt: "2026-06-01", featured: false },
      { id: "featured", publishedAt: "2026-03-01", featured: true },
      { id: "oldest", publishedAt: "2026-01-01", featured: false },
    ];

    expect(selectFeatured(sorted)?.id).toBe("featured");
  });

  it("falls back to the newest article when nothing is featured", () => {
    const sorted = [
      { id: "newest", publishedAt: "2026-06-01", featured: undefined },
      { id: "oldest", publishedAt: "2026-01-01", featured: undefined },
    ];

    expect(selectFeatured(sorted)?.id).toBe("newest");
  });

  it("returns undefined when there are no articles at all", () => {
    expect(selectFeatured([])).toBeUndefined();
  });
});

describe("resolveServedLocale", () => {
  it("uses the requested locale when a translation exists", () => {
    expect(resolveServedLocale("en", ["ro", "en"])).toBe("en");
  });

  it("falls back to ro when the requested locale has no translation", () => {
    expect(resolveServedLocale("en", ["ro"])).toBe("ro");
  });

  it("returns undefined when the article doesn't exist in any locale", () => {
    expect(resolveServedLocale("en", [])).toBeUndefined();
  });
});
