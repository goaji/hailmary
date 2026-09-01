import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n";
import { OG_CONTENT_TYPE, OG_FONTS, OG_PAGE_BG, OG_SIZE, OG_TEXT_MUTED } from "@/utils/og";
import { DEFAULT_TEAM, TEAMS_BY_SLUG } from "@/utils/teams";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The site-wide fallback: any route without its own opengraph-image.tsx
// (currently /program and /echipe, alongside the homepage itself) inherits
// this one, per Next's "more specific wins" file-convention resolution.
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "meta" });
  const team = TEAMS_BY_SLUG[DEFAULT_TEAM];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 28,
          backgroundColor: OG_PAGE_BG,
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Bebas Neue", fontSize: 96, letterSpacing: 2 }}>
          <span style={{ color: OG_TEXT_MUTED }}>HAIL</span>
          <span style={{ color: team.accent1 }}>MARY</span>
          <span style={{ color: OG_TEXT_MUTED, fontSize: 64, marginLeft: 8 }}>.RO</span>
        </div>
        <span style={{ display: "flex", fontFamily: "Work Sans", fontSize: 30, color: OG_TEXT_MUTED }}>
          {t("description")}
        </span>
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
