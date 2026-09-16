"use client"; // reads history/location client-side to pick a week without the page depending on server-side searchParams

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./ScheduleWeekSwitcher.module.scss";

type ScheduleWeekSwitcherProps = {
  weeks: number[];
  defaultWeek: number;
  weekNavLabel: string;
  weeksHeading: string;
  weekLabels: Record<number, string>;
  weekAriaLabels: Record<number, string>;
  titleLabels: Record<number, string>;
  tables: Record<number, ReactNode>;
  liveStatus?: ReactNode;
  updatedAtNote?: ReactNode;
};

type WeekListProps = {
  weeks: number[];
  weekLabels: Record<number, string>;
  weekAriaLabels: Record<number, string>;
  selectedWeek: number;
  onSelect: (week: number) => void;
};

function WeekList({ weeks, weekLabels, weekAriaLabels, selectedWeek, onSelect }: WeekListProps) {
  return (
    <ul className={styles.list}>
      {weeks.map((week) => (
        <li key={week}>
          <Link
            href={`/program?etapa=${week}`}
            aria-current={week === selectedWeek ? "page" : undefined}
            aria-label={weekAriaLabels[week]}
            className={week === selectedWeek ? styles.linkActive : styles.link}
            onClick={(event) => {
              event.preventDefault();
              window.history.pushState(null, "", `?etapa=${week}`);
              onSelect(week);
            }}
          >
            {weekLabels[week]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Every week's table is pre-rendered server-side and passed in via `tables`;
// this only ever mounts one of them. Navigation updates the URL with
// history.pushState instead of next-intl's router so switching weeks never
// asks the server for a fresh render.
export function ScheduleWeekSwitcher({
  weeks,
  defaultWeek,
  weekNavLabel,
  weeksHeading,
  weekLabels,
  weekAriaLabels,
  titleLabels,
  tables,
  liveStatus,
  updatedAtNote,
}: ScheduleWeekSwitcherProps) {
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);

  useEffect(() => {
    function syncFromUrl() {
      const requested = Number.parseInt(
        new URLSearchParams(window.location.search).get("etapa") ?? "",
        10,
      );
      setSelectedWeek(
        Number.isInteger(requested) && weeks.includes(requested) ? requested : defaultWeek,
      );
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [weeks, defaultWeek]);

  const content = (
    <div className={styles.content}>
      {liveStatus}
      {tables[selectedWeek]}
      {updatedAtNote}
    </div>
  );

  const heading = <SectionHeading as="h1">{titleLabels[selectedWeek]}</SectionHeading>;

  if (weeks.length <= 1) {
    return (
      <div className={styles.scheduleWeekSwitcher}>
        {heading}
        {content}
      </div>
    );
  }

  return (
    <div className={styles.scheduleWeekSwitcher}>
      {heading}
      <div className={styles.layout}>
        <div className={styles.rail}>
          <nav aria-label={weekNavLabel} className={styles.desktopRail}>
            <h2 className={styles.heading}>{weeksHeading}</h2>
            <WeekList
              weeks={weeks}
              weekLabels={weekLabels}
              weekAriaLabels={weekAriaLabels}
              selectedWeek={selectedWeek}
              onSelect={setSelectedWeek}
            />
          </nav>
          <details className={styles.mobileRail}>
            <summary className={styles.summary}>
              {weeksHeading}
              <span className={styles.chevron} aria-hidden="true" />
            </summary>
            <WeekList
              weeks={weeks}
              weekLabels={weekLabels}
              weekAriaLabels={weekAriaLabels}
              selectedWeek={selectedWeek}
              onSelect={setSelectedWeek}
            />
          </details>
        </div>
        {content}
      </div>
    </div>
  );
}
