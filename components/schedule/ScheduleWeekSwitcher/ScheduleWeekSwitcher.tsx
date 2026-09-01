"use client"; // reads history/location client-side to pick a week without the page depending on server-side searchParams

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n";
import styles from "./ScheduleWeekSwitcher.module.scss";

type ScheduleWeekSwitcherProps = {
  weeks: number[];
  defaultWeek: number;
  weekNavLabel: string;
  weekLabels: Record<number, string>;
  tables: Record<number, ReactNode>;
};

// Every week's table is pre-rendered server-side and passed in via `tables`;
// this only ever mounts one of them. Navigation updates the URL with
// history.pushState instead of next-intl's router so switching weeks never
// asks the server for a fresh render.
export function ScheduleWeekSwitcher({
  weeks,
  defaultWeek,
  weekNavLabel,
  weekLabels,
  tables,
}: ScheduleWeekSwitcherProps) {
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);

  useEffect(() => {
    function syncFromUrl() {
      const requested = Number.parseInt(
        new URLSearchParams(window.location.search).get("etapa") ?? "",
        10,
      );
      setSelectedWeek(Number.isInteger(requested) && weeks.includes(requested) ? requested : defaultWeek);
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [weeks, defaultWeek]);

  return (
    <>
      {weeks.length > 1 && (
        <nav aria-label={weekNavLabel} className={styles.weekNav}>
          <ul className={styles.weekList}>
            {weeks.map((week) => (
              <li key={week}>
                <Link
                  href={`/program?etapa=${week}`}
                  aria-current={week === selectedWeek ? "page" : undefined}
                  className={week === selectedWeek ? styles.weekLinkActive : styles.weekLink}
                  onClick={(event) => {
                    event.preventDefault();
                    window.history.pushState(null, "", `?etapa=${week}`);
                    setSelectedWeek(week);
                  }}
                >
                  {weekLabels[week]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {tables[selectedWeek]}
    </>
  );
}
