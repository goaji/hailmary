import { Link } from "@/i18n";
import styles from "./LinkList.module.scss";

type LinkListLinkItem = {
  label: string;
  href: string;
};

type LinkListValueItem = {
  label: string;
  value: string;
};

type LinkListProps =
  | { variant: "link"; items: LinkListLinkItem[] }
  | { variant: "value"; items: LinkListValueItem[] };

export function LinkList(props: LinkListProps) {
  return (
    <ul className={styles.list}>
      {props.variant === "link"
        ? props.items.map((item) => (
            <li key={item.href} className={styles.row}>
              <Link href={item.href} className={`${styles.rowContent} ${styles.rowLink}`}>
                <span>{item.label}</span>
                <span className={styles.chevron} aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))
        : props.items.map((item) => (
            <li key={item.label} className={styles.row}>
              <span className={styles.rowContent}>
                <span>{item.label}</span>
                <span className={styles.value}>{item.value}</span>
              </span>
            </li>
          ))}
    </ul>
  );
}
