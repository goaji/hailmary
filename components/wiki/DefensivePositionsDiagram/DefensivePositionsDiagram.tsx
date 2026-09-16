"use client"; // resolves its own translations, then delegates rendering to the shared FormationDiagram

import { useTranslations } from "next-intl";
import {
  FormationDiagram,
  type FormationDot,
  type FormationPosition,
} from "@/components/wiki/FormationDiagram/FormationDiagram";

const POSITION_IDS = ["dl", "lb", "cb", "s"] as const;

// A base 4-3-with-two-safeties look — not tactically exact, just enough to read as a formation, mirroring the offense page's CB/WR width.
const DOTS: FormationDot[] = [
  { position: "cb", x: 8, y: 50 },
  { position: "dl", x: 42, y: 50 },
  { position: "dl", x: 47, y: 50 },
  { position: "dl", x: 53, y: 50 },
  { position: "dl", x: 58, y: 50 },
  { position: "cb", x: 92, y: 50 },
  { position: "lb", x: 40, y: 34 },
  { position: "lb", x: 50, y: 32 },
  { position: "lb", x: 60, y: 34 },
  { position: "s", x: 40, y: 16 },
  { position: "s", x: 60, y: 16 },
];

// Registered in articleComponents — any Wiki page can drop <DefensivePositionsDiagram /> into its MDX body with no per-article import.
export function DefensivePositionsDiagram() {
  const t = useTranslations("defensivePositionsDiagram");

  const positions: FormationPosition[] = POSITION_IDS.map((id) => ({
    id,
    label: t(`${id}Label`),
    blurb: t(`${id}Blurb`),
  }));

  return (
    <FormationDiagram
      widgetLabel={t("widgetLabel")}
      hint={t("hint")}
      positions={positions}
      dots={DOTS}
    />
  );
}
