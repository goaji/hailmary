import type { Conference, Division, Team } from "@/types";
import { TeamCard } from "@/components/teams/TeamCard/TeamCard";
import styles from "./DivisionGroup.module.scss";

type DivisionGroupProps = {
  conference: Conference;
  division: Division;
  teams: Team[];
};

// Division names are proper nouns ("AFC East"), not translated — same
// treatment as team names, per AGENTS.md.
export function DivisionGroup({ conference, division, teams }: DivisionGroupProps) {
  const headingId = `division-${conference}-${division}`;

  return (
    <section aria-labelledby={headingId} className={styles.group}>
      <h3 id={headingId} className={styles.heading}>
        {division}
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
