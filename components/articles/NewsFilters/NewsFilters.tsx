"use client"; // local filter selections are page-local UI state (AGENTS.md — useState, not lifted)

import { useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";
import { CATEGORY_IDS } from "@/types";
import type { Category } from "@/types";
import { CATEGORIES } from "@/utils/categories";
import { CONFERENCES, DIVISIONS, getTeamsByDivision } from "@/utils/teams";
import styles from "./NewsFilters.module.scss";

export type NewsFilterItem = {
  slug: string;
  category: Category;
  teams?: string[];
  node: ReactNode;
};

type NewsFiltersProps = {
  items: NewsFilterItem[];
  /** Set when items are ro-fallback content served under a different locale — see NewsGrid's equivalent use. */
  lang?: string;
};

export function NewsFilters({ items, lang }: NewsFiltersProps) {
  const t = useTranslations("newsIndex");
  const tCategories = useTranslations("categories");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [team, setTeam] = useState("all");
  const categorySelectId = useId();
  const teamSelectId = useId();

  const byCategory = category === "all" ? items : items.filter((item) => item.category === category);
  const filtered = team === "all" ? byCategory : byCategory.filter((item) => item.teams?.includes(team));

  return (
    <div>
      <div className={styles.filterBar}>
        <div className={styles.field}>
          <label htmlFor={categorySelectId} className={styles.label}>
            {t("categoryFilterLabel")}
          </label>
          <select
            id={categorySelectId}
            className={styles.select}
            value={category}
            onChange={(event) => setCategory(event.target.value as "all" | Category)}
          >
            <option value="all">{t("allCategories")}</option>
            {CATEGORY_IDS.map((id) => (
              <option key={id} value={id}>
                {tCategories(CATEGORIES[id].messageKey)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor={teamSelectId} className={styles.label}>
            {t("teamFilterLabel")}
          </label>
          <select
            id={teamSelectId}
            className={styles.select}
            value={team}
            onChange={(event) => setTeam(event.target.value)}
          >
            <option value="all">{t("allTeams")}</option>
            {CONFERENCES.map((conference) =>
              DIVISIONS.map((division) => (
                <optgroup key={`${conference}-${division}`} label={`${conference} ${division}`}>
                  {getTeamsByDivision(conference, division).map((teamOption) => (
                    <option key={teamOption.slug} value={teamOption.slug}>
                      {teamOption.name}
                    </option>
                  ))}
                </optgroup>
              )),
            )}
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.grid} lang={lang}>
          {filtered.map((item) => item.node)}
        </div>
      ) : (
        <p className={styles.empty} role="status">
          {t("emptyFiltered")}
        </p>
      )}
    </div>
  );
}
