import { getLocale, getTranslations } from "next-intl/server";
import type { Game } from "@/types";
import { GameRow } from "@/components/schedule/GameRow/GameRow";
import styles from "./ScheduleTable.module.scss";

type ScheduleTableProps = {
  games: Game[];
  week: number;
};

export async function ScheduleTable({ games, week }: ScheduleTableProps) {
  const locale = await getLocale();
  const t = await getTranslations("scheduleTable");

  return (
    // role="region" is what lets aria-label apply to a <div> — same pattern as ArticleBody's MdxTable.
    <div role="region" aria-label={t("scrollLabel")} tabIndex={0} className={styles.tableWrapper}>
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
    </div>
  );
}
