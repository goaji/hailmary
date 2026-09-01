import { describe, expect, it } from "vitest";
import {
  bcp47Locale,
  buildBreadcrumbJsonLd,
  buildNewsArticleJsonLd,
  buildSportsOrganizationJsonLd,
  jsonLdScript,
} from "./structuredData";

describe("buildNewsArticleJsonLd", () => {
  it("builds a valid NewsArticle shape", () => {
    const jsonLd = buildNewsArticleJsonLd({
      headline: "Chiefs câștigă al treilea titlu consecutiv",
      datePublished: "2026-08-29",
      authorName: "Andrei Popescu",
      imageUrl: "https://hailmary.ro/images/articles/chiefs.jpg",
      url: "https://hailmary.ro/ro/stiri/chiefs-al-treilea-titlu-consecutiv",
      inLanguage: "ro-RO",
    });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "Chiefs câștigă al treilea titlu consecutiv",
      datePublished: "2026-08-29",
      author: { "@type": "Person", name: "Andrei Popescu" },
      image: ["https://hailmary.ro/images/articles/chiefs.jpg"],
      inLanguage: "ro-RO",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://hailmary.ro/ro/stiri/chiefs-al-treilea-titlu-consecutiv",
      },
    });
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers items starting at 1, root first", () => {
    const jsonLd = buildBreadcrumbJsonLd([
      { name: "Acasă", url: "https://hailmary.ro/ro" },
      { name: "Echipe", url: "https://hailmary.ro/ro/echipe" },
      { name: "Kansas City Chiefs", url: "https://hailmary.ro/ro/echipe/kc" },
    ]);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Acasă", item: "https://hailmary.ro/ro" },
      { "@type": "ListItem", position: 2, name: "Echipe", item: "https://hailmary.ro/ro/echipe" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Kansas City Chiefs",
        item: "https://hailmary.ro/ro/echipe/kc",
      },
    ]);
  });

  it("handles a single-item breadcrumb", () => {
    const jsonLd = buildBreadcrumbJsonLd([{ name: "Acasă", url: "https://hailmary.ro/ro" }]);
    expect(jsonLd.itemListElement).toHaveLength(1);
    expect(jsonLd.itemListElement[0].position).toBe(1);
  });
});

describe("buildSportsOrganizationJsonLd", () => {
  it("builds a valid SportsOrganization shape", () => {
    const jsonLd = buildSportsOrganizationJsonLd({
      name: "Kansas City Chiefs",
      url: "https://hailmary.ro/ro/echipe/kc",
      logoUrl: "https://hailmary.ro/logos/kc.svg",
      league: "NFL",
    });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "SportsOrganization",
      name: "Kansas City Chiefs",
      url: "https://hailmary.ro/ro/echipe/kc",
      logo: "https://hailmary.ro/logos/kc.svg",
      sport: "American Football",
      memberOf: { "@type": "SportsOrganization", name: "NFL" },
    });
  });
});

describe("bcp47Locale", () => {
  it("maps known locales to BCP 47 tags", () => {
    expect(bcp47Locale("ro")).toBe("ro-RO");
    expect(bcp47Locale("en")).toBe("en-US");
  });

  it("passes through an unknown locale unchanged", () => {
    expect(bcp47Locale("fr")).toBe("fr");
  });
});

describe("jsonLdScript", () => {
  it("serializes to valid JSON", () => {
    const data = { "@type": "Thing", name: "Test" };
    expect(JSON.parse(jsonLdScript(data))).toEqual(data);
  });

  it("escapes '<' so a value can't close the surrounding script tag", () => {
    const data = { name: "</script><script>alert(1)</script>" };
    const script = jsonLdScript(data);

    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c/script>");
    expect(JSON.parse(script.replace(/\\u003c/g, "<"))).toEqual(data);
  });
});
