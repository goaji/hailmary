import { describe, expect, it } from "vitest";
import {
  extractH2Headings,
  groupEntriesByEra,
  parseReferenceFrontmatter,
  parseSeeAlso,
  splitSectionContent,
  validateEntryEras,
  validateSectionHeadings,
} from "./reference";

const validFrontmatter = {
  title: "Regulamentul fotbalului american",
  description: "Bazele jocului, explicate pentru un începător.",
  sections: [
    { id: "obiectiv", title: "Obiectivul jocului" },
    { id: "teren", title: "Terenul și dimensiunile" },
  ],
};

describe("parseReferenceFrontmatter", () => {
  it("accepts a valid file and defaults section level to 2", () => {
    const result = parseReferenceFrontmatter(validFrontmatter, "test.mdx");

    expect(result.title).toBe(validFrontmatter.title);
    expect(result.sections).toEqual([
      { id: "obiectiv", title: "Obiectivul jocului", level: 2 },
      { id: "teren", title: "Terenul și dimensiunile", level: 2 },
    ]);
  });

  it("accepts an explicit section level", () => {
    const result = parseReferenceFrontmatter(
      {
        ...validFrontmatter,
        sections: [{ id: "sub", title: "Un subtitlu", level: 3 }],
      },
      "test.mdx",
    );

    expect(result.sections[0].level).toBe(3);
  });

  it("accepts optional timeline entries", () => {
    const result = parseReferenceFrontmatter(
      {
        title: "Istoria fotbalului american",
        description: "O cronologie.",
        sections: [{ id: "origini", title: "Origini" }],
        entries: [{ year: "1920", title: "Se înființează liga", body: "Text.", era: "origini" }],
      },
      "test.mdx",
    );

    expect(result.entries).toHaveLength(1);
  });

  it("rejects a file missing a required field, naming the file and the field", () => {
    const { title, ...missingTitle } = validFrontmatter;
    void title;

    expect(() =>
      parseReferenceFrontmatter(missingTitle, "content/reference/ro/x.mdx"),
    ).toThrow('content/reference/ro/x.mdx: field "title"');
  });

  it("rejects an empty sections array", () => {
    expect(() =>
      parseReferenceFrontmatter({ ...validFrontmatter, sections: [] }, "test.mdx"),
    ).toThrow(/"sections"/);
  });
});

describe("extractH2Headings", () => {
  it("collects every top-level heading in document order", () => {
    const content = "Intro.\n\n## Primul\n\nText.\n\n## Al doilea\n\nText.";

    expect(extractH2Headings(content)).toEqual(["Primul", "Al doilea"]);
  });

  it("ignores h3 and deeper headings", () => {
    const content = "## Secțiune\n\n### Subsecțiune\n\nText.";

    expect(extractH2Headings(content)).toEqual(["Secțiune"]);
  });

  it("returns an empty array for content with no headings", () => {
    expect(extractH2Headings("Doar text simplu.")).toEqual([]);
  });
});

describe("splitSectionContent", () => {
  const sections = [
    { id: "obiectiv", title: "Obiectivul jocului", level: 2 as const },
    { id: "teren", title: "Terenul și dimensiunile", level: 2 as const },
  ];

  it("slices each heading through the next into its own body, in order", () => {
    const content =
      "## Obiectivul jocului\n\nPrimul paragraf.\n\n## Terenul și dimensiunile\n\nAl doilea paragraf.";

    const result = splitSectionContent(content, sections);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: "obiectiv", title: "Obiectivul jocului" });
    expect(result[0].body).toBe("## Obiectivul jocului\n\nPrimul paragraf.");
    expect(result[1].body).toBe("## Terenul și dimensiunile\n\nAl doilea paragraf.");
  });

  it("runs the last section through to the end of the content", () => {
    const content = "## Obiectivul jocului\n\nA.\n\n## Terenul și dimensiunile\n\nB.\n\nC.";

    const result = splitSectionContent(content, sections);

    expect(result[1].body).toBe("## Terenul și dimensiunile\n\nB.\n\nC.");
  });
});

describe("validateSectionHeadings", () => {
  const sections = [
    { id: "obiectiv", title: "Obiectivul jocului" },
    { id: "teren", title: "Terenul și dimensiunile" },
  ];

  it("passes silently when headings match sections in count, order and text", () => {
    const content = "## Obiectivul jocului\n\nText.\n\n## Terenul și dimensiunile\n\nText.";

    expect(() => validateSectionHeadings(content, sections, "test.mdx")).not.toThrow();
  });

  it("throws naming the file when heading count doesn't match", () => {
    const content = "## Obiectivul jocului\n\nText.";

    expect(() => validateSectionHeadings(content, sections, "content/reference/ro/x.mdx")).toThrow(
      "content/reference/ro/x.mdx: frontmatter declares 2 section(s) but content has 1",
    );
  });

  it("throws naming the section id when heading text has drifted from the frontmatter title", () => {
    const content = "## Obiectivul jocului\n\nText.\n\n## Terenul (revizuit)\n\nText.";

    expect(() => validateSectionHeadings(content, sections, "test.mdx")).toThrow(
      '"teren"',
    );
  });
});

describe("validateEntryEras", () => {
  const sections = [{ id: "origini" }, { id: "era-moderna" }];

  it("passes silently when every entry references a known era", () => {
    const entries = [
      { year: "1920", title: "A", body: "B", era: "origini" },
      { year: "1970", title: "C", body: "D", era: "era-moderna" },
    ];

    expect(() => validateEntryEras(entries, sections, "test.mdx")).not.toThrow();
  });

  it("throws naming the file, entry and unknown era", () => {
    const entries = [{ year: "1995", title: "Extinderea ligii", body: "B", era: "era-libera" }];

    expect(() => validateEntryEras(entries, sections, "content/reference/ro/istorie.mdx")).toThrow(
      'content/reference/ro/istorie.mdx: timeline entry "Extinderea ligii" (1995) references unknown era "era-libera"',
    );
  });
});

describe("groupEntriesByEra", () => {
  const sections = [
    { id: "origini", title: "Origini", level: 2 as const },
    { id: "era-moderna", title: "Era modernă", level: 2 as const },
  ];

  it("buckets entries under their era, in section order", () => {
    const entries = [
      { year: "1920", title: "A", body: "B", era: "origini" },
      { year: "1970", title: "C", body: "D", era: "era-moderna" },
      { year: "1906", title: "E", body: "F", era: "origini" },
    ];

    const groups = groupEntriesByEra(entries, sections);

    expect(groups).toHaveLength(2);
    expect(groups[0].section.id).toBe("origini");
    expect(groups[0].entries.map((e) => e.title)).toEqual(["A", "E"]);
    expect(groups[1].entries.map((e) => e.title)).toEqual(["C"]);
  });

  it("tracks a running ordinal across eras rather than restarting each group at 1", () => {
    const entries = [
      { year: "1920", title: "A", body: "B", era: "origini" },
      { year: "1906", title: "C", body: "D", era: "origini" },
      { year: "1970", title: "E", body: "F", era: "era-moderna" },
    ];

    const groups = groupEntriesByEra(entries, sections);

    expect(groups[0].startOrdinal).toBe(1);
    expect(groups[1].startOrdinal).toBe(3);
  });

  it("returns an empty entries array for an era with no matching entries", () => {
    const groups = groupEntriesByEra([], sections);

    expect(groups[0].entries).toEqual([]);
    expect(groups[1].startOrdinal).toBe(1);
  });
});

describe("parseSeeAlso", () => {
  it("parses a route with a section anchor", () => {
    expect(parseSeeAlso("/regulament#pase")).toEqual({ slug: "regulament", id: "pase" });
  });

  it("parses a route with no anchor", () => {
    expect(parseSeeAlso("/istorie")).toEqual({ slug: "istorie", id: undefined });
  });

  it("returns undefined for an external or malformed route", () => {
    expect(parseSeeAlso("https://example.com")).toBeUndefined();
    expect(parseSeeAlso("regulament#pase")).toBeUndefined();
  });
});
