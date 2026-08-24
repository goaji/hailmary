"use client"; // reads/writes the active locale via next-intl navigation hooks

import { useLocale, useTranslations } from "next-intl";
import { Link, routing, usePathname } from "@/i18n";
import styles from "./LocaleSwitcher.module.scss";

const localeNames: Record<(typeof routing.locales)[number], string> = {
  ro: "Română",
  en: "English",
};

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className={styles.localeSwitcher} aria-label={t("label")}>
      {routing.locales.map((cur) => (
        <Link
          key={cur}
          href={pathname}
          locale={cur}
          className={styles.option}
          aria-current={cur === locale ? "true" : undefined}
        >
          {localeNames[cur]}
        </Link>
      ))}
    </nav>
  );
}
