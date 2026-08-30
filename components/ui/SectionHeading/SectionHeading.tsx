import type { ReactNode } from "react";
import styles from "./SectionHeading.module.scss";

type SectionHeadingProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({ children, as: Tag = "h2" }: SectionHeadingProps) {
  return <Tag className={styles.heading}>{children}</Tag>;
}
