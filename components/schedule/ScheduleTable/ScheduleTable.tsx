import { getTranslations } from "next-intl/server";
import type { Game } from "@/types";
import { GameRow } from "@/components/schedule/GameRow/GameRow";
import styles from "./ScheduleTable.module.scss";

type ScheduleTableProps = {
  games: Game[];
  week: number;
  locale: string;
};

export async function ScheduleTable({ games, week, locale }: ScheduleTableProps) {
  const t = await getTranslations({ locale, namespace: "scheduleTable" });

  return (
    // A named <section> maps to role "region" — same pattern as ArticleBody's MdxTable.
    <section aria-label={t("scrollLabel")} tabIndex={0} className={styles.scheduleTable}>
      <table className={styles.table}>
        <caption className={styles.caption}>{t("caption", { week })}</caption>
        <thead>
          <tr>
            <th scope="col">{t("matchup")}</th>
            <th scope="col">{t("kickoff")}</th>
            <th scope="col">{t("score")}</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <GameRow key={game.id} game={game} locale={locale} />
          ))}
        </tbody>
      </table>
    </section>
  );
}
