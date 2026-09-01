import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { getArticleBySlug } from "@/utils/articles";
import { CATEGORIES } from "@/utils/categories";
import { OG_CONTENT_TYPE, OG_FONTS, OG_PAGE_BG, OG_SIZE, OG_TEXT, OgWordmark, truncateForOg } from "@/utils/og";
import { DEFAULT_TEAM, TEAMS_BY_SLUG } from "@/utils/teams";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug, locale as "ro" | "en");

  // The tagged team's colors when there is one — Tag.tsx's chip always
  // renders in accent2 regardless of the category's declared accent slot
  // (both slots fail the 4.5:1 bar for several teams at accent1), so this
  // mirrors that rather than branching on CATEGORIES[category].accent.
  const team = TEAMS_BY_SLUG[article?.teams?.[0] ?? DEFAULT_TEAM];
  const t = await getTranslations({ locale: article?.servedLocale ?? "ro", namespace: "categories" });
  const categoryLabel = article ? t(CATEGORIES[article.category].messageKey) : "";

  return new ImageResponse(
    (
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
        <div style={{ display: "flex", width: "100%", height: 10, backgroundColor: team.accent1 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              display: "flex",
              fontFamily: "Work Sans",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: team.accent2,
            }}
          >
            {categoryLabel}
          </span>
          <span
            style={{
              display: "flex",
              fontFamily: "Bebas Neue",
              fontSize: 72,
              lineHeight: 1.05,
              color: OG_TEXT,
            }}
          >
            {truncateForOg(article?.title ?? "hailmary.ro", 90)}
          </span>
        </div>

        <OgWordmark accent={team.accent1} />
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
