import Image from "next/image";
import type { Team } from "@/types";
import styles from "./TeamBadge.module.scss";

export type TeamBadgeSize = "sm" | "md" | "lg";

type TeamBadgeProps = {
  team: Team;
  size?: TeamBadgeSize;
};

const LOGO_DIMENSION: Record<TeamBadgeSize, number> = {
  sm: 20,
  md: 32,
  lg: 64,
};

export function TeamBadge({ team, size = "md" }: TeamBadgeProps) {
  const dimension = LOGO_DIMENSION[size];

  return (
    <span className={`${styles.badge} ${styles[size]}`}>
      {/* alt="" — the team name renders as adjacent text right below, so an
          alt like "Kansas City Chiefs logo" would announce the name twice. */}
      <Image
        src={team.logoUrl}
        alt=""
        width={dimension}
        height={dimension}
        className={styles.logo}
      />
      <span className={styles.name}>{team.name}</span>
    </span>
  );
}
