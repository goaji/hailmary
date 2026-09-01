import type { Conference, Division, Team } from "@/types";
import { TeamCard } from "@/components/teams/TeamCard/TeamCard";
import styles from "./DivisionGroup.module.scss";

type DivisionGroupProps = {
  conference: Conference;
  division: Division;
  teams: Team[];
  /** Id of the page's "AFC"/"NFC" heading — see the aria-labelledby note below. */
  conferenceHeadingId: string;
};

// Division names are proper nouns ("AFC East"), not translated — same
// treatment as team names, per AGENTS.md.
export function DivisionGroup({
  conference,
  division,
  teams,
  conferenceHeadingId,
}: DivisionGroupProps) {
  const headingId = `division-${conference}-${division}`;

  return (
    // aria-labelledby lists the conference heading before the division one
    // so the landmark's accessible name is "AFC East", not just "East" —
    // AFC East and NFC East would otherwise be two landmarks with the same
    // name (axe: landmark-unique). The visible h3 text stays just "East";
    // sighted users get the conference from the nested heading hierarchy.
    <section aria-labelledby={`${conferenceHeadingId} ${headingId}`} className={styles.group}>
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
