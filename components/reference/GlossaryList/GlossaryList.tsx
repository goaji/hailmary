"use client"; // live filter text is local UI state (AGENTS.md — useState, not lifted)

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import styles from "./GlossaryList.module.scss";

export type GlossaryListItem = {
  slug: string;
  term: string;
  short: string;
  seeAlso?: string;
  extended: ReactNode;
};

type GlossaryListProps = {
  items: GlossaryListItem[];
};

function matchesQuery(item: GlossaryListItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return (
    item.term.toLowerCase().includes(needle) || item.short.toLowerCase().includes(needle)
  );
}

export function GlossaryList({ items }: GlossaryListProps) {
  const t = useTranslations("glossary");
  const [query, setQuery] = useState("");
  const filterId = useId();
  const filtered = items.filter((item) => matchesQuery(item, query));

  return (
    <div>
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

      {filtered.length === 0 ? (
        <p className={styles.empty} role="status">
          {t("noResults")}
        </p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((item) => (
            <li key={item.slug} className={styles.entry}>
              {/* Native <details> — expand/collapse, keyboard support and
                  browser-native disclosure semantics all come free (verified
                  against Chromium's real accessibility tree: <summary> gets
                  the DisclosureTriangle role, which AT announces correctly
                  even though it isn't literally ARIA "button" — so this
                  won't be reachable via Playwright's getByRole('button') in
                  step 6, use `summary` + text instead).
                  The #slug id has to live on a DESCENDANT inside the
                  collapsible region, not on <details> itself — confirmed by
                  testing, contrary to a literal reading of the HTML "reveal"
                  algorithm: Chromium only auto-opens an ancestor <details>
                  when the fragment target is nested inside it. Put on
                  <details> directly, a deep link would scroll to a still-
                  collapsed card and break the step-1 no-JS contract. */}
              {/* suppressHydrationWarning: the browser's own fragment-
                  navigation "reveal" algorithm can set `open` on this
                  element before React hydrates (fragments never reach the
                  server, so SSR can't know to render it) — a real,
                  unavoidable mismatch on this one attribute, not a bug. */}
              <details className={styles.details} suppressHydrationWarning>
                <summary className={styles.summary}>
                  <h2 className={styles.term}>{item.term}</h2>
                  <span className={styles.chevron} aria-hidden="true" />
                </summary>
                <div id={item.slug} className={styles.detailsContent}>
                  <p className={styles.short}>{item.short}</p>
                  {item.extended}
                  {item.seeAlso ? (
                    <Link href={item.seeAlso} className={styles.seeAlso}>
                      {t("seeAlso")}
                    </Link>
                  ) : null}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
