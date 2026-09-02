import { Link } from "@/i18n";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher/LanguageSwitcher";
import { TeamPicker } from "@/components/layout/TeamPicker/TeamPicker";
import { SiteNav } from "@/components/layout/SiteNav/SiteNav";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
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
