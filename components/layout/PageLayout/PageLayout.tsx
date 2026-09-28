import type { ReactNode } from "react";
import styles from "./PageLayout.module.scss";

type PageLayoutProps = {
  /** Sits above the main column on desktop, and above everything on mobile. */
  heading?: ReactNode;
  children: ReactNode;
} & (
  | {
      aside: ReactNode;
      /** Nav rails collapse to a dropdown above the content on mobile; supplementary panels go below it. */
      asideOnMobile: "above" | "below";
    }
  // Without an aside, main takes the full width at every breakpoint.
  | { aside?: undefined; asideOnMobile?: undefined }
);

// Source order follows the mobile stacking so reading order matches what's on screen.
export function PageLayout({ heading, aside, children, asideOnMobile }: PageLayoutProps) {
  const asideNode = <div className={styles.aside}>{aside}</div>;
  const className = [
    styles.pageLayout,
    heading ? styles.withHeading : null,
    aside ? null : styles.noAside,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      {heading ? <div className={styles.heading}>{heading}</div> : null}
      {aside && asideOnMobile === "above" ? asideNode : null}
      <div className={styles.main}>{children}</div>
      {aside && asideOnMobile === "below" ? asideNode : null}
    </div>
  );
}
