import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card/Card";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { UpcomingGamesPanel } from "@/components/home/UpcomingGamesPanel/UpcomingGamesPanel";
import styles from "./Sidebar.module.scss";

const BEGINNER_GUIDE_HEADING_ID = "beginner-guide-heading";
const SCHEDULE_HEADING_ID = "schedule-heading";
const SIDEBAR_GAME_COUNT = 3;

type SidebarProps = {
  locale: string;
};

export async function Sidebar({ locale }: SidebarProps) {
  const t = await getTranslations({ locale, namespace: "sidebar" });

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
              {
                label: t("beginnerGuide.hailMaryOrigin"),
                href: "/wiki/istorie/meciuri-si-faze-legendare#hail-mary",
              },
              {
                label: t("beginnerGuide.history"),
                href: "/wiki/istorie/originile-si-cresterea-nfl",
              },
            ]}
          />
        </Card>
      </section>

      <section aria-labelledby={SCHEDULE_HEADING_ID}>
        <Card>
          <h2 id={SCHEDULE_HEADING_ID} className={styles.panelHeading}>
            {t("schedule.heading")}
          </h2>
          <UpcomingGamesPanel
            locale={locale}
            emptyLabel={t("schedule.empty")}
            count={SIDEBAR_GAME_COUNT}
          />
        </Card>
      </section>
    </div>
  );
}
