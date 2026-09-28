import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/types";
import { Panel } from "@/components/ui/Panel/Panel";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { UpcomingGames } from "@/components/schedule/UpcomingGames/UpcomingGames";
import styles from "./Sidebar.module.scss";

const SIDEBAR_GAME_COUNT = 3;

type SidebarProps = {
  locale: Locale;
  /** Page-specific panels, stacked above the site-wide ones. */
  children?: ReactNode;
};

// The news pages' shared sidebar: whatever the page adds, then the beginner's guide and the week's games.
export async function Sidebar({ locale, children }: SidebarProps) {
  const t = await getTranslations({ locale, namespace: "sidebar" });

  return (
    <div className={styles.sidebar}>
      {children}

      <Panel heading={t("beginnerGuide.heading")}>
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
      </Panel>

      <Panel heading={t("schedule.heading")}>
        <UpcomingGames
          locale={locale}
          emptyLabel={t("schedule.empty")}
          count={SIDEBAR_GAME_COUNT}
        />
      </Panel>
    </div>
  );
}
