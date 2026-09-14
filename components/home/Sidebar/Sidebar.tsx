import { getLocale, getTranslations } from "next-intl/server";
import type { Game } from "@/types";
import { Card } from "@/components/ui/Card/Card";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { LiveScoreStatus } from "@/components/schedule/LiveScoreStatus/LiveScoreStatus";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import { hasLiveGame } from "@/utils/liveGames";
import styles from "./Sidebar.module.scss";

const BEGINNER_GUIDE_HEADING_ID = "beginner-guide-heading";
const SCHEDULE_HEADING_ID = "schedule-heading";

type SidebarProps = {
  games: Game[];
  /** Whether the schedule store has synced real data. */
  isLive: boolean;
};

export async function Sidebar({ games, isLive }: SidebarProps) {
  const locale = await getLocale();
  const t = await getTranslations("sidebar");

  return (
    <div className={styles.sidebar}>
      <section aria-labelledby={BEGINNER_GUIDE_HEADING_ID}>
        <Card>
          <h2 id={BEGINNER_GUIDE_HEADING_ID} className={styles.panelHeading}>
            {t("beginnerGuide.heading")}
          </h2>
          <LinkList
            variant="link"
            items={[
              { label: t("beginnerGuide.rules"), href: "/wiki/the-game/obiectiv-si-scor" },
              { label: t("beginnerGuide.positions"), href: "/wiki/chess-match/pozitii-ofensive" },
              { label: t("beginnerGuide.glossary"), href: "/glosar" },
              { label: t("beginnerGuide.hailMaryOrigin"), href: "/wiki/istorie/meciuri-si-faze-legendare#hail-mary" },
              { label: t("beginnerGuide.history"), href: "/wiki/istorie/originile-si-cresterea-nfl" },
            ]}
          />
        </Card>
      </section>

      <section aria-labelledby={SCHEDULE_HEADING_ID}>
        <Card>
          <h2 id={SCHEDULE_HEADING_ID} className={styles.panelHeading}>
            {t("schedule.heading")}
          </h2>
          {games.length > 0 ? (
            <>
              <LiveScoreStatus initialIsLive={isLive} hasLiveGames={hasLiveGame(games)} />
              <LinkList
                variant="value"
                items={games.map((game) => ({
                  label: `${getTeam(game.awayTeamId).shortName} @ ${getTeam(game.homeTeamId).shortName}`,
                  value: formatKickoff(game.kickoff, locale),
                }))}
              />
            </>
          ) : (
            <p className={styles.empty}>{t("schedule.empty")}</p>
          )}
        </Card>
      </section>
    </div>
  );
}
