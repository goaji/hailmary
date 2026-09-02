import type { MetadataRoute } from "next";
import { HEADER_BG } from "@/utils/theme";

const PAGE_BG = "#14151a"; // $c-page

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "hailmary.ro — Fotbal american NFL, în română",
    short_name: "Hail Mary",
    description: "Fotbal american NFL, în română.",
    start_url: "/",
    display: "standalone",
    background_color: PAGE_BG,
    theme_color: HEADER_BG,
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
