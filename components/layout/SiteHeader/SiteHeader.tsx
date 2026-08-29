"use client"; // usePathname (next-intl) for active-route highlighting is client-only

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n";
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

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoHail}>HAIL</span>
        <span className={styles.logoMary}>MARY</span>
        <span className={styles.logoRo}>.RO</span>
      </Link>

      <nav aria-label={t("mainLabel")}>
        <ul className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={isActive ? styles.navLinkActive : styles.navLink}
                  aria-current={isActive ? "page" : undefined}
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
