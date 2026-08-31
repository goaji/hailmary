import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card/Card";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { getScheduleFixture } from "@/utils/schedule";
import { getTeam } from "@/utils/teams";
import { formatKickoff } from "@/utils/formatKickoff";
import styles from "./Sidebar.module.scss";

export async function Sidebar() {
  const locale = await getLocale();
  const t = await getTranslations("sidebar");
  const games = getScheduleFixture();

  return (
    <div className={styles.sidebar}>
      <Card>
        <h2 className={styles.panelHeading}>{t("beginnerGuide.heading")}</h2>
        <LinkList
          variant="link"
          items={[
            { label: t("beginnerGuide.rules"), href: "/regulament" },
            { label: t("beginnerGuide.positions"), href: "/regulament/pozitii" },
            { label: t("beginnerGuide.glossary"), href: "/glosar" },
            { label: t("beginnerGuide.hailMaryOrigin"), href: "/istorie/hail-mary" },
            { label: t("beginnerGuide.history"), href: "/istorie" },
          ]}
        />
      </Card>

      <Card>
        <h2 className={styles.panelHeading}>{t("schedule.heading")}</h2>
        <LinkList
          variant="value"
          items={games.map((game) => ({
            label: `${getTeam(game.awayTeamId).shortName} @ ${getTeam(game.homeTeamId).shortName}`,
            value: formatKickoff(game.kickoff, locale),
          }))}
        />
      </Card>
    </div>
  );
}
