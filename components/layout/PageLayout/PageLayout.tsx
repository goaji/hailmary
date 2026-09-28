import type { ReactNode } from "react";
import styles from "./PageLayout.module.scss";

type PageLayoutProps = {
  /** Sits above the main column on desktop, and above everything on mobile. */
  heading?: ReactNode;
  aside: ReactNode;
  children: ReactNode;
  /** Nav rails collapse to a dropdown above the content on mobile; supplementary panels go below it. */
  asideOnMobile: "above" | "below";
};

// Source order follows the mobile stacking so reading order matches what's on screen.
export function PageLayout({ heading, aside, children, asideOnMobile }: PageLayoutProps) {
  const asideNode = <div className={styles.aside}>{aside}</div>;

  return (
    <div className={heading ? `${styles.pageLayout} ${styles.withHeading}` : styles.pageLayout}>
      {heading ? <div className={styles.heading}>{heading}</div> : null}
      {asideOnMobile === "above" ? asideNode : null}
      <div className={styles.main}>{children}</div>
      {asideOnMobile === "below" ? asideNode : null}
    </div>
  );
}
