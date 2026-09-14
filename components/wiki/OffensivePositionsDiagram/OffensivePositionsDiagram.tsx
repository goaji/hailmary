"use client"; // resolves its own translations, then delegates rendering to the shared FormationDiagram

import { useTranslations } from "next-intl";
import { FormationDiagram, type FormationDot, type FormationPosition } from "@/components/wiki/FormationDiagram/FormationDiagram";

const POSITION_IDS = ["qb", "rb", "wr", "te", "ol"] as const;

// A simplified shotgun-ish layout — not tactically exact, just enough to read as a formation.
const DOTS: FormationDot[] = [
  { position: "wr", x: 8, y: 50 },
  { position: "ol", x: 40, y: 50 },
  { position: "ol", x: 45, y: 50 },
  { position: "ol", x: 50, y: 50 },
  { position: "ol", x: 55, y: 50 },
  { position: "ol", x: 60, y: 50 },
  { position: "te", x: 66, y: 50 },
  { position: "wr", x: 92, y: 50 },
  { position: "qb", x: 50, y: 68 },
  { position: "rb", x: 46, y: 84 },
];

// Registered in articleComponents — any Wiki page can drop <OffensivePositionsDiagram /> into its MDX body with no per-article import.
export function OffensivePositionsDiagram() {
  const t = useTranslations("offensivePositionsDiagram");

  const positions: FormationPosition[] = POSITION_IDS.map((id) => ({
    id,
    label: t(`${id}Label`),
    blurb: t(`${id}Blurb`),
  }));

  return <FormationDiagram widgetLabel={t("widgetLabel")} hint={t("hint")} positions={positions} dots={DOTS} />;
}
