"use client"; // local search filter state

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import styles from "./GlossaryRail.module.scss";

export type GlossaryRailTerm = {
  slug: string;
  term: string;
  letter: string;
};

type GlossaryRailProps = {
  /** Every letter with at least one term, sorted. */
  letters: string[];
  /** The letter of the page this rail is rendered on. */
  currentLetter: string;
  /** Every term, across all letters — search matches the whole glossary. */
  allTerms: GlossaryRailTerm[];
};

function matchesQuery(term: GlossaryRailTerm, query: string): boolean {
  return term.term.toLowerCase().includes(query.trim().toLowerCase());
}

// Search filters this rail only — the page underneath stays unfiltered.
function RailBody({ letters, currentLetter, allTerms }: GlossaryRailProps) {
  const t = useTranslations("glossary");
  const [query, setQuery] = useState("");
  const filterId = useId();
  const isSearching = query.trim().length > 0;
  const matches = isSearching ? allTerms.filter((term) => matchesQuery(term, query)) : [];

  return (
    <>
      <div className={styles.filterRow}>
        <label htmlFor={filterId} className={styles.filterLabel}>
          {t("filterLabel")}
        </label>
        <input
          id={filterId}
          type="search"
          role="searchbox"
          className={styles.filterInput}
          placeholder={t("filterPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {isSearching ? (
        matches.length === 0 ? (
          <p className={styles.empty} role="status">
            {t("noResults")}
          </p>
        ) : (
          <ul className={styles.list}>
            {matches.map((term) => (
              <li key={term.slug}>
                <Link href={`/glosar/${term.letter.toLowerCase()}#${term.slug}`} className={styles.termLink}>
                  {term.term}
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className={styles.list}>
          {letters.map((letter) => {
            const isCurrent = letter === currentLetter;
            return (
              <li key={letter}>
                <Link
                  href={`/glosar/${letter.toLowerCase()}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={styles.letterLink}
                >
                  {letter}
                </Link>
                {isCurrent ? (
                  <ul className={styles.termSubList}>
                    {allTerms
                      .filter((term) => term.letter === letter)
                      .map((term) => (
                        <li key={term.slug}>
                          <a href={`#${term.slug}`} className={styles.termLink}>
                            {term.term}
                          </a>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function GlossaryRail(props: GlossaryRailProps) {
  const t = useTranslations("glossary");

  return (
    <>
      <nav aria-label={t("railLabel")} className={styles.desktopRail}>
        <RailBody {...props} />
      </nav>

      <details className={styles.mobileRail}>
        <summary className={styles.summary}>
          {t("railMobileLabel")}
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <nav aria-label={t("railLabel")}>
          <RailBody {...props} />
        </nav>
      </details>
    </>
  );
}
