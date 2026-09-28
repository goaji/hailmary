import { Link } from "@/i18n";
import styles from "./PrevNext.module.scss";

type PrevNextLink = {
  href: string;
  title: string;
};

type PrevNextProps = {
  /** Accessible name of the <nav>, so several prev/next landmarks on a site stay distinguishable. */
  label: string;
  previousLabel: string;
  nextLabel: string;
  previous?: PrevNextLink;
  next?: PrevNextLink;
};

export function PrevNext({ label, previousLabel, nextLabel, previous, next }: PrevNextProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav aria-label={label} className={styles.prevNext}>
      {previous ? (
        <Link href={previous.href} className={styles.previous}>
          <span className={styles.direction}>{previousLabel}</span>
          <span className={styles.title}>{previous.title}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={next.href} className={styles.next}>
          <span className={styles.direction}>{nextLabel}</span>
          <span className={styles.title}>{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
