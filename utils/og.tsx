import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";

// Satori (next/og's ImageResponse) has no access to next/font, CSS modules,
// or any external stylesheet — only inline styles and font binaries handed
// directly to ImageResponse. Everything below duplicates a site token or a
// site fragment (the header wordmark) for that reason, the same way
// utils/teams.ts duplicates $c-text/$c-page.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FONTS_DIR = path.join(process.cwd(), "assets", "fonts");

/** Real Bebas Neue / Work Sans binaries, subset to latin-ext (see assets/fonts) so ă/â/î/ș/ț render — a system-font fallback would silently change the design in every social preview. Read once at module scope per the next/og docs' guidance for request-independent assets. */
export const OG_FONTS = [
  {
    name: "Bebas Neue",
    data: fs.readFileSync(path.join(FONTS_DIR, "BebasNeue-Regular.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Work Sans",
    data: fs.readFileSync(path.join(FONTS_DIR, "WorkSans-Regular.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Work Sans",
    data: fs.readFileSync(path.join(FONTS_DIR, "WorkSans-Bold.ttf")),
    weight: 700 as const,
    style: "normal" as const,
  },
];

// $c-page / $c-text / $c-text-muted from styles/_variables.scss.
export const OG_PAGE_BG = "#14151a";
export const OG_TEXT = "#f5f4f2";
export const OG_TEXT_MUTED = "#9a9ba3";

/**
 * Keeps an OG title within a length the template's fixed font size can lay
 * out in the space available, breaking on a word boundary rather than
 * mid-word. Satori has no CSS line-clamp/ellipsis support, so this is the
 * only truncation mechanism.
 */
export function truncateForOg(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${base.trimEnd()}…`;
}

/** Reads a local SVG (relative to /public) and inlines it as a data URI — OG generation has no browser to fetch a same-origin URL from, so the file is embedded directly. */
export function svgDataUri(publicPath: string): string {
  const filePath = path.join(process.cwd(), "public", publicPath);
  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/** The header's "HAIL MARY.RO" wordmark, reproduced with inline styles for Satori. `accent` is the one color that varies by context (a team's accent/brand color, or the default team's when no team applies). */
export function OgWordmark({ accent }: { accent: string }): ReactElement {
  return (
    <div style={{ display: "flex", fontFamily: "Bebas Neue", fontSize: 30, letterSpacing: 1 }}>
      <span style={{ color: OG_TEXT }}>HAIL</span>
      <span style={{ color: accent }}>MARY</span>
      <span style={{ color: OG_TEXT_MUTED, fontSize: 20, marginLeft: 6 }}>.RO</span>
    </div>
  );
}

type ReferenceOgCardProps = {
  kicker: string;
  title: string;
  /** Large UI element (the accent bar, the wordmark) — accent1's contrast tier. */
  accentBar: string;
  /** Small bold uppercase text (the kicker) — accent2's contrast tier, same reasoning as Tag.tsx's category chip. */
  accentText: string;
};

/** Shared "title + kicker" card for /regulament, /istorie and /glosar — identical layout per AGENTS.md's step 2 spec, differing only in kicker label and title. */
export function ReferenceOgCard({ kicker, title, accentBar, accentText }: ReferenceOgCardProps): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: OG_PAGE_BG,
        padding: 64,
      }}
    >
      <div style={{ display: "flex", width: "100%", height: 10, backgroundColor: accentBar }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span
          style={{
            display: "flex",
            fontFamily: "Work Sans",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: accentText,
          }}
        >
          {kicker}
        </span>
        <span
          style={{
            display: "flex",
            fontFamily: "Bebas Neue",
            fontSize: 84,
            lineHeight: 1.05,
            color: OG_TEXT,
          }}
        >
          {truncateForOg(title, 60)}
        </span>
      </div>

      <OgWordmark accent={accentBar} />
    </div>
  );
}
