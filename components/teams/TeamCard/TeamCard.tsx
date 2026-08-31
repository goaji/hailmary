import { getTranslations } from "next-intl/server";
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

export async function TeamCard({ team }: TeamCardProps) {
  const tConference = await getTranslations("conferences");
  const tDivision = await getTranslations("divisions");

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

        <p className={styles.divisionLabel}>
          {tConference(team.conference)} · {tDivision(team.division)}
        </p>
      </Card>
    </div>
  );
}
