"use client"; // roving-tabindex keyboard nav and reads/writes the selected team

import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { PICKER_TEAMS, getTeam } from "@/utils/teams";
import { useRovingSelection } from "@/components/ui/useRovingSelection";
import { useTeamColor } from "@/components/layout/TeamColorProvider/TeamColorProvider";
import styles from "./TeamPicker.module.scss";

type SwatchStyle = CSSProperties & {
  "--swatch": string;
};

export function TeamPicker() {
  const t = useTranslations("teamPicker");
  const { teamId, setTeam } = useTeamColor();
  const { registerButton, handleKeyDown } = useRovingSelection(PICKER_TEAMS, setTeam);

  return (
    <div className={styles.teamPicker} role="radiogroup" aria-label={t("label")}>
      {PICKER_TEAMS.map((slug, index) => {
        const team = getTeam(slug);
        const isSelected = teamId === slug;
        const swatchStyle: SwatchStyle = { "--swatch": team.brand1 };

        return (
          <button
            key={slug}
            ref={registerButton(index)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={team.name}
            tabIndex={isSelected ? 0 : -1}
            className={styles.swatch}
            style={swatchStyle}
            onClick={() => setTeam(slug)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        );
      })}
    </div>
  );
}
