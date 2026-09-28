import { getTranslations } from "next-intl/server";
import type { Locale } from "@/types";
import { CONFERENCES, DIVISIONS, getTeamsByDivision } from "@/utils/teams";
import { TeamsRailList, type TeamsRailGroup } from "./TeamsRailList";
import styles from "./TeamsRail.module.scss";

type TeamsRailProps = {
  locale: Locale;
};

// Conference and division names are proper nouns ("AFC East"), not translated — same as team names.
const GROUPS: TeamsRailGroup[] = CONFERENCES.flatMap((conference) =>
  DIVISIONS.map((division) => ({
    label: `${conference} ${division}`,
    teams: getTeamsByDivision(conference, division),
  })),
);

export async function TeamsRail({ locale }: TeamsRailProps) {
  const t = await getTranslations({ locale, namespace: "teams" });

  return (
    <div className={styles.teamsRail}>
      <nav aria-label={t("railLabel")} className={styles.desktopRail}>
        <TeamsRailList groups={GROUPS} />
      </nav>

      <details className={styles.mobileRail}>
        <summary className={styles.summary}>
          {t("railMobileLabel")}
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <nav aria-label={t("railLabel")}>
          <TeamsRailList groups={GROUPS} />
        </nav>
      </details>
    </div>
  );
}
