"use client"; // reads history/location client-side to pick a week without the page depending on server-side searchParams

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./ScheduleWeekSwitcher.module.scss";

export type ScheduleWeek = {
  week: number;
  label: string;
  ariaLabel: string;
  title: string;
  table: ReactNode;
};

type ScheduleWeekSwitcherProps = {
  weeks: ScheduleWeek[];
  defaultWeek: number;
  weekNavLabel: string;
  weeksHeading: string;
  liveStatus?: ReactNode;
  updatedAtNote?: ReactNode;
};

type WeekListProps = {
  weeks: ScheduleWeek[];
  selectedWeek: number;
  onSelect: (week: number) => void;
};

function WeekList({ weeks, selectedWeek, onSelect }: WeekListProps) {
  return (
    <ul className={styles.list}>
      {weeks.map(({ week, label, ariaLabel }) => (
        <li key={week}>
          <Link
            href={`/program?etapa=${week}`}
            aria-current={week === selectedWeek ? "page" : undefined}
            aria-label={ariaLabel}
            className={week === selectedWeek ? styles.linkActive : styles.link}
            onClick={(event) => {
              event.preventDefault();
              window.history.pushState(null, "", `?etapa=${week}`);
              onSelect(week);
            }}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Every week's table is pre-rendered and passed in via `weeks`;
// this only ever mounts one of them. Navigation updates the URL with
// history.pushState instead of next-intl's router so switching weeks never
// asks the server for a fresh render.
export function ScheduleWeekSwitcher({
  weeks,
  defaultWeek,
  weekNavLabel,
  weeksHeading,
  liveStatus,
  updatedAtNote,
}: ScheduleWeekSwitcherProps) {
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const selected = weeks.find(({ week }) => week === selectedWeek);

  useEffect(() => {
    function syncFromUrl() {
      const requested = Number.parseInt(
        new URLSearchParams(window.location.search).get("etapa") ?? "",
        10,
      );
      setSelectedWeek(
        Number.isInteger(requested) && weeks.some(({ week }) => week === requested)
          ? requested
          : defaultWeek,
      );
    }
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [weeks, defaultWeek]);

  const content = (
    <div className={styles.content}>
      {liveStatus}
      {selected?.table}
      {updatedAtNote}
    </div>
  );

  const heading = <SectionHeading as="h1">{selected?.title}</SectionHeading>;

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
            <WeekList weeks={weeks} selectedWeek={selectedWeek} onSelect={setSelectedWeek} />
          </nav>
          <details className={styles.mobileRail}>
            <summary className={styles.summary}>
              {weeksHeading}
              <span className={styles.chevron} aria-hidden="true" />
            </summary>
            <WeekList weeks={weeks} selectedWeek={selectedWeek} onSelect={setSelectedWeek} />
          </details>
        </div>
        {content}
      </div>
    </div>
  );
}
