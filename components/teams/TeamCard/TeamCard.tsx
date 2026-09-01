import type { CSSProperties } from "react";
import type { Team } from "@/types";
import { Link } from "@/i18n";
import { Card } from "@/components/ui/Card/Card";
import { TeamBadge } from "@/components/teams/TeamBadge/TeamBadge";
import styles from "./TeamCard.module.scss";

type TeamCardProps = {
  team: Team;
};

type WrapperStyle = CSSProperties & {
  "--team-brand": string;
};

export function TeamCard({ team }: TeamCardProps) {
  const wrapperStyle: WrapperStyle = { "--team-brand": team.brand1 };

  return (
    <div className={styles.wrapper} style={wrapperStyle}>
      <Card>
        {/* brand1 as decoration (never as text color) — the left edge is the
            card's identity treatment, per AGENTS.md's brand-vs-accent rule. */}
        <span className={styles.edge} aria-hidden="true" />

        {/* TeamBadge already renders the team name as adjacent text (see its
            own alt="" decision), so it doubles as this card's title anchor —
            no separate name element to avoid announcing it twice. */}
        <Link href={`/echipe/${team.slug}`} className={styles.titleLink}>
          <TeamBadge team={team} size="md" />
        </Link>

        {/* Conference/division are proper nouns ("AFC East"), not translated
            — same treatment as team names, per AGENTS.md. */}
        <p className={styles.divisionLabel}>
          {team.conference} · {team.division}
        </p>
      </Card>
    </div>
  );
}
