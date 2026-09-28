"use client"; // the rail lives in the teams layout, which gets no [team] param, so the current team comes from the URL

import { useId } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Link } from "@/i18n";
import type { Team } from "@/types";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import styles from "./TeamsRail.module.scss";

export type TeamsRailGroup = {
  label: string;
  teams: Team[];
};

type TeamsRailListProps = {
  groups: TeamsRailGroup[];
};

export function TeamsRailList({ groups }: TeamsRailListProps) {
  const currentSlug = useSelectedLayoutSegment();
  const idPrefix = useId();

  return (
    <ul className={styles.groups}>
      {groups.map((group, index) => {
        const labelId = `${idPrefix}-${index}`;

        return (
          <li key={group.label} className={styles.group}>
            <span id={labelId} className={styles.groupLabel}>
              {group.label}
            </span>
            <ul aria-labelledby={labelId} className={styles.teams}>
              {group.teams.map((team) => (
                <li key={team.slug}>
                  <Link
                    href={`/echipe/${team.slug}`}
                    aria-current={team.slug === currentSlug ? "page" : undefined}
                    className={styles.link}
                  >
                    <TeamBadge team={team} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
