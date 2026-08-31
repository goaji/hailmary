import type { TimelineEntry as TimelineEntryData } from "@/types";
import styles from "./TimelineEntry.module.scss";

type TimelineEntryProps = {
  entry: TimelineEntryData;
};

export function TimelineEntry({ entry }: TimelineEntryProps) {
  return (
    <li className={styles.entry}>
      <span className={styles.dot} aria-hidden="true" />
      <div className={styles.heading}>
        <span className={styles.year}>{entry.year}</span>
        <h3 className={styles.title}>{entry.title}</h3>
      </div>
      <p className={styles.body}>{entry.body}</p>
    </li>
  );
}
