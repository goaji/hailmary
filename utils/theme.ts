// $c-header from styles/_variables.scss — Sass variables aren't importable
// into TS/Satori-rendered routes, so this is the one place that duplicates it.
export const HEADER_BG = "#0d0e12";

// $c-page from styles/_variables.scss.
export const PAGE_BG = "#14151a";

// How far the page and header shift toward the selected team's accent1.
export const TEAM_TINT_PERCENT = 10;

function channels(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [0, 1, 2].map((i) => parseInt(value.slice(i * 2, i * 2 + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toSrgb(linear: number): number {
  const clamped = Math.min(1, Math.max(0, linear));
  const c = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(c * 255);
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Shifts a dark surface toward a team accent's hue while keeping the surface's
 * own luminance. WCAG contrast is a function of luminance alone, so every
 * ratio measured against the surface — accent text, muted text, borders —
 * survives the tint unchanged, and no team's accents need re-deriving.
 */
export function tintSurface(
  baseHex: string,
  accentHex: string,
  percent: number = TEAM_TINT_PERCENT,
): string {
  const base = channels(baseHex).map(toLinear) as [number, number, number];
  const accent = channels(accentHex).map(toLinear) as [number, number, number];
  const weight = percent / 100;
  const mixed = base.map((value, i) => value * (1 - weight) + accent[i] * weight) as [
    number,
    number,
    number,
  ];

  const mixedLuminance = luminance(mixed);
  // A pure-black accent can't be scaled back up to the base luminance; leave the surface as it was.
  const scale = mixedLuminance === 0 ? 0 : luminance(base) / mixedLuminance;
  const restored = scale === 0 ? base : mixed.map((value) => value * scale);

  return `#${restored.map((value) => toSrgb(value).toString(16).padStart(2, "0")).join("")}`;
}

/** The tinted page/header pair for one team, as the CSS custom properties that carry them. */
export function teamSurfaceVars(accent1: string): { "--c-page": string; "--c-header": string } {
  return {
    "--c-page": tintSurface(PAGE_BG, accent1),
    "--c-header": tintSurface(HEADER_BG, accent1),
  };
}
