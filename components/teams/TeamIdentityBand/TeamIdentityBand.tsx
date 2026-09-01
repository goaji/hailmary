import Image from "next/image";
import type { CSSProperties } from "react";
import type { Team } from "@/types";
import { onBrandColor } from "@/utils/teams";
import styles from "./TeamIdentityBand.module.scss";

type TeamIdentityBandProps = {
  team: Team;
};

type BandStyle = CSSProperties & {
  "--band-bg": string;
  "--band-fg": string;
};

export function TeamIdentityBand({ team }: TeamIdentityBandProps) {
  const bandStyle: BandStyle = {
    "--band-bg": team.brand1,
    "--band-fg": onBrandColor(team),
  };

  return (
    <div className={styles.band} style={bandStyle}>
      {/* alt="" — the h1 right beside it already carries the team name as
          text, so an alt like "Kansas City Chiefs logo" would double it. */}
      <Image src={team.logoUrl} alt="" width={64} height={64} className={styles.logo} />
      <div className={styles.text}>
        <h1 className={styles.name}>{team.name}</h1>
        {/* Conference/division are proper nouns, not translated — same
            treatment as team names, per AGENTS.md. */}
        <p className={styles.meta}>
          {team.conference} · {team.division}
        </p>
      </div>
    </div>
  );
}
