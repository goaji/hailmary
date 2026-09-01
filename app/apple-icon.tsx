import { ImageResponse } from "next/og";
import { OG_FONTS } from "@/utils/og";
import { DEFAULT_TEAM, TEAMS_BY_SLUG } from "@/utils/teams";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const HEADER_BG = "#0d0e12"; // $c-header

export default function AppleIcon() {
  const accent = TEAMS_BY_SLUG[DEFAULT_TEAM].accent1;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: HEADER_BG,
        }}
      >
        <span style={{ display: "flex", fontFamily: "Bebas Neue", fontSize: 150, color: accent }}>
          H
        </span>
      </div>
    ),
    { ...size, fonts: [OG_FONTS[0]] },
  );
}
