import type { ReactNode } from "react";
import styles from "./SectionHeading.module.scss";

type SectionHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  /** So a wrapping <section> can reference this heading via aria-labelledby. */
  id?: string;
};

export function SectionHeading({ children, as: Tag = "h2", id }: SectionHeadingProps) {
  return (
    <Tag id={id} className={styles.heading}>
      {children}
    </Tag>
  );
}
