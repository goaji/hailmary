"use client"; // usePathname (next-intl) + mobile nav open/closed state are client-only

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n";
import styles from "./SiteNav.module.scss";

const NAV_ITEMS = [
  { key: "news", href: "/stiri" },
  { key: "teams", href: "/echipe" },
  { key: "rules", href: "/regulament" },
  { key: "history", href: "/istorie" },
  { key: "schedule", href: "/program" },
  { key: "glossary", href: "/glosar" },
] as const;

export function SiteNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navId = useId();

  return (
    <>
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

      <nav
        id={navId}
        aria-label={t("mainLabel")}
        className={isNavOpen ? styles.navRegionOpen : styles.navRegion}
      >
        <ul className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            // Matches child routes too (e.g. /echipe/kc under /echipe,
            // /stiri/[slug] under /stiri) — harmless for items that don't
            // have any.
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

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
    </>
  );
}
