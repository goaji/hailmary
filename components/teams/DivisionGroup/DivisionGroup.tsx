import { getTranslations } from "next-intl/server";
import type { Conference, Division, Team } from "@/types";
import { TeamCard } from "@/components/teams/TeamCard/TeamCard";
import styles from "./DivisionGroup.module.scss";

type DivisionGroupProps = {
  conference: Conference;
  division: Division;
  teams: Team[];
};

export async function DivisionGroup({ conference, division, teams }: DivisionGroupProps) {
  const tDivision = await getTranslations("divisions");
  const headingId = `division-${conference}-${division}`;

  return (
    <section aria-labelledby={headingId} className={styles.group}>
      <h3 id={headingId} className={styles.heading}>
        {tDivision(division)}
      </h3>
      <ul className={styles.list}>
        {teams.map((team) => (
          <li key={team.slug}>
            <TeamCard team={team} />
          </li>
        ))}
      </ul>
    </section>
  );
}
