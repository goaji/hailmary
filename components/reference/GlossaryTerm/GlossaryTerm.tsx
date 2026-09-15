import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import { FallbackNotice } from "@/components/ui/FallbackNotice/FallbackNotice";
import type { GlossaryEntry, Locale } from "@/types";
import styles from "./GlossaryTerm.module.scss";

type GlossaryTermProps = {
  entry: Omit<GlossaryEntry, "extended">;
  locale: Locale;
  extended: ReactNode;
};

// Always-expanded — no <details>; a single letter's list is short enough.
export async function GlossaryTerm({ entry, locale, extended }: GlossaryTermProps) {
  const t = await getTranslations({ locale, namespace: "glossary" });
  const isFallback = entry.servedLocale !== locale;

  return (
    <article id={entry.slug} className={styles.term}>
      <h2 className={styles.heading}>{entry.term}</h2>
      {isFallback ? <FallbackNotice locale={locale}>{t("fallbackNotice")}</FallbackNotice> : null}
      <p className={styles.short}>{entry.short}</p>
      {extended}
      {entry.seeAlso ? (
        <Link href={entry.seeAlso} className={styles.seeAlso}>
          {t("seeAlso")}
        </Link>
      ) : null}
    </article>
  );
}
