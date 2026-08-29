"use client"; // roving-tabindex keyboard nav and reads/writes the selected team

import { useTranslations } from "next-intl";
import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { PICKER_TEAMS, getTeam } from "@/utils/teams";
import { useTeamColor } from "@/components/layout/TeamColorProvider/TeamColorProvider";
import styles from "./TeamPicker.module.scss";

type SwatchStyle = CSSProperties & {
  "--swatch": string;
};

export function TeamPicker() {
  const t = useTranslations("teamPicker");
  const { teamId, setTeam } = useTeamColor();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusAndSelect(index: number) {
    const wrapped = (index + PICKER_TEAMS.length) % PICKER_TEAMS.length;
    const nextTeamId = PICKER_TEAMS[wrapped];
    setTeam(nextTeamId);
    buttonRefs.current[wrapped]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(index - 1);
        break;
    }
  }

  return (
    <div className={styles.picker} role="radiogroup" aria-label={t("label")}>
      {PICKER_TEAMS.map((slug, index) => {
        const team = getTeam(slug);
        const isSelected = teamId === slug;
        const swatchStyle: SwatchStyle = { "--swatch": team.brand1 };

        return (
          <button
            key={slug}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
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
