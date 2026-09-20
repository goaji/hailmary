import { Link } from "@/i18n";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher/LanguageSwitcher";
import { TeamPicker } from "@/components/layout/TeamPicker/TeamPicker";
import { SiteNav } from "@/components/layout/SiteNav/SiteNav";
import { SITE_HEADER_ID } from "./siteHeaderConstants";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  return (
    <header id={SITE_HEADER_ID} className={styles.siteHeader}>
      <div className={styles.inner}>
        {/* Flex items get spaces between them in the accessible name; the label keeps it one word. */}
        <Link href="/" className={styles.logo} aria-label="HAILMARY.RO">
          <span className={styles.logoHail}>HAIL</span>
          <span className={styles.logoMary}>MARY</span>
          <span className={styles.logoRo}>.RO</span>
        </Link>

        <SiteNav />

        <div className={styles.rightGroup}>
          <TeamPicker />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
