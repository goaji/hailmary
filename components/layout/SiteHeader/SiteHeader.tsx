"use client"; // usePathname (next-intl) + mobile nav open/closed state are client-only

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher/LanguageSwitcher";
import { TeamPicker } from "@/components/layout/TeamPicker/TeamPicker";
import styles from "./SiteHeader.module.scss";

const NAV_ITEMS = [
  { key: "news", href: "/stiri" },
  { key: "teams", href: "/echipe" },
  { key: "rules", href: "/regulament" },
  { key: "history", href: "/istorie" },
  { key: "schedule", href: "/program" },
  { key: "glossary", href: "/glosar" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navId = useId();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoHail}>HAIL</span>
        <span className={styles.logoMary}>MARY</span>
        <span className={styles.logoRo}>.RO</span>
      </Link>

      <button
        type="button"
        className={styles.navToggle}
        aria-expanded={isNavOpen}
        aria-controls={navId}
        aria-label={t("toggleLabel")}
        onClick={() => setIsNavOpen((open) => !open)}
      >
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
          <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <div className={styles.rightGroup}>
        <TeamPicker />
        <LanguageSwitcher />
      </div>

      <nav
        id={navId}
        aria-label={t("mainLabel")}
        className={isNavOpen ? styles.navRegionOpen : styles.navRegion}
      >
        <ul className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={isActive ? styles.navLinkActive : styles.navLink}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsNavOpen(false)}
                >
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
