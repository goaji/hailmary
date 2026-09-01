import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_FONTS, OG_SIZE, OgWordmark, svgDataUri } from "@/utils/og";
import { DEFAULT_TEAM, TEAMS_BY_SLUG, onBrandColor } from "@/utils/teams";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team: teamSlug } = await params;
  const team = TEAMS_BY_SLUG[teamSlug] ?? TEAMS_BY_SLUG[DEFAULT_TEAM];
  const foreground = onBrandColor(team);
  const logoSrc = svgDataUri(team.logoUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: team.brand1,
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <img src={logoSrc} width={220} height={220} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ display: "flex", fontFamily: "Bebas Neue", fontSize: 88, lineHeight: 1, color: foreground }}>
              {team.name}
            </span>
            <span
              style={{
                display: "flex",
                fontFamily: "Work Sans",
                fontSize: 26,
                letterSpacing: 1,
                color: foreground,
                opacity: 0.85,
              }}
            >
              {team.conference} · {team.division}
            </span>
          </div>
        </div>

        <OgWordmark accent={foreground} />
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
