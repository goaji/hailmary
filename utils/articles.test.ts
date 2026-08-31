import { describe, expect, it } from "vitest";
import {
  excludeArticleBySlug,
  parseArticleFrontmatter,
  resolveServedLocale,
  selectAdjacentArticles,
  selectFeatured,
  selectRelatedArticles,
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

describe("excludeArticleBySlug", () => {
  const articles = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];

  it("removes the article matching the given slug", () => {
    expect(excludeArticleBySlug(articles, "b").map((a) => a.slug)).toEqual([
      "a",
      "c",
    ]);
  });

  it("returns the list unchanged when slug is undefined", () => {
    expect(excludeArticleBySlug(articles, undefined)).toEqual(articles);
  });

  it("returns the list unchanged when the slug isn't present", () => {
    expect(excludeArticleBySlug(articles, "not-there")).toEqual(articles);
  });
});

describe("selectRelatedArticles", () => {
  const current = { slug: "current", category: "analiza" };

  it("picks same-category articles first, newest first", () => {
    const articles = [
      { slug: "a", category: "analiza" },
      current,
      { slug: "b", category: "draft" },
      { slug: "c", category: "analiza" },
    ];

    expect(selectRelatedArticles(articles, current).map((a) => a.slug)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("tops up with the newest overall when fewer than the limit share the category", () => {
    const articles = [
      current,
      { slug: "a", category: "draft" },
      { slug: "b", category: "program" },
      { slug: "c", category: "regulament" },
      { slug: "d", category: "transferuri" },
    ];

    expect(selectRelatedArticles(articles, current).map((a) => a.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("excludes the current article even if it's in the input list", () => {
    const articles = [current, { slug: "a", category: "analiza" }];

    expect(selectRelatedArticles(articles, current).some((a) => a.slug === "current")).toBe(
      false,
    );
  });

  it("respects a custom limit", () => {
    const articles = [
      current,
      { slug: "a", category: "analiza" },
      { slug: "b", category: "analiza" },
    ];

    expect(selectRelatedArticles(articles, current, 1).map((a) => a.slug)).toEqual(["a"]);
  });
});

describe("selectAdjacentArticles", () => {
  const sorted = [{ slug: "newest" }, { slug: "middle" }, { slug: "oldest" }];

  it("returns the older article as previous and the newer as next", () => {
    expect(selectAdjacentArticles(sorted, "middle")).toEqual({
      previous: { slug: "oldest" },
      next: { slug: "newest" },
    });
  });

  it("omits next for the newest article", () => {
    expect(selectAdjacentArticles(sorted, "newest")).toEqual({
      previous: { slug: "middle" },
      next: undefined,
    });
  });

  it("omits previous for the oldest article", () => {
    expect(selectAdjacentArticles(sorted, "oldest")).toEqual({
      previous: undefined,
      next: { slug: "middle" },
    });
  });

  it("returns both undefined when the slug isn't found", () => {
    expect(selectAdjacentArticles(sorted, "missing")).toEqual({});
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
