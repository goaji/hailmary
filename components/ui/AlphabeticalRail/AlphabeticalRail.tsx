"use client"; // local filtering and glossary hash state

import { useId, useState, useSyncExternalStore } from "react";
import { Link } from "@/i18n";
import styles from "./AlphabeticalRail.module.scss";

export type AlphabeticalRailItem = {
  id: string;
  label: string;
  href: string;
  current?: boolean;
};

export type AlphabeticalRailGroup = {
  letter: string;
  href?: string;
  current?: boolean;
  items: AlphabeticalRailItem[];
};

type AlphabeticalRailProps = {
  groups: AlphabeticalRailGroup[];
  filterLabel: string;
  filterPlaceholder: string;
  noResults: string;
  railLabel: string;
  mobileLabel: string;
  expandCurrentGroupOnly?: boolean;
  hashLocation?: boolean;
};

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function subscribeToNothing() {
  return () => {};
}

function readHash() {
  return window.location.hash.slice(1);
}

function readNoHash() {
  return "";
}

function RailItemLink({ item, targetId }: { item: AlphabeticalRailItem; targetId: string }) {
  const current = targetId === item.id ? "location" : item.current ? "page" : undefined;

  // Next routes hash links through pushState, which never fires hashchange
  if (item.href.startsWith("#")) {
    return (
      <a href={item.href} aria-current={current} className={styles.itemLink}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} aria-current={current} className={styles.itemLink}>
      {item.label}
    </Link>
  );
}

function RailBody({
  groups,
  filterLabel,
  filterPlaceholder,
  noResults,
  expandCurrentGroupOnly,
  hashLocation,
}: Omit<AlphabeticalRailProps, "railLabel" | "mobileLabel">) {
  const [query, setQuery] = useState("");
  const filterId = useId();
  const targetId = useSyncExternalStore(
    hashLocation ? subscribeToHash : subscribeToNothing,
    hashLocation ? readHash : readNoHash,
    readNoHash,
  );
  const matches = groups
    .flatMap((group) => group.items)
    .filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  const isSearching = query.trim().length > 0;

  return (
    <>
      <div className={styles.filterRow}>
        <label htmlFor={filterId} className={styles.filterLabel}>
          {filterLabel}
        </label>
        <input
          id={filterId}
          type="search"
          role="searchbox"
          className={styles.filterInput}
          placeholder={filterPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {isSearching ? (
        matches.length > 0 ? (
          <ul className={styles.list}>
            {matches.map((item) => (
              <li key={item.id}>
                <RailItemLink item={item} targetId={targetId} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty} role="status">
            {noResults}
          </p>
        )
      ) : (
        <ul className={styles.list}>
          {groups.map((group) => (
            <li key={group.letter}>
              {group.href ? (
                <Link
                  href={group.href}
                  aria-current={group.current ? "page" : undefined}
                  className={`${styles.groupLabel} ${group.current ? styles.currentGroup : ""}`}
                >
                  {group.letter}
                </Link>
              ) : (
                <span
                  className={`${styles.groupLabel} ${group.current ? styles.currentGroup : ""}`}
                >
                  {group.letter}
                </span>
              )}
              {!expandCurrentGroupOnly || group.current ? (
                <ul className={styles.subList}>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <RailItemLink item={item} targetId={targetId} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function AlphabeticalRail(props: AlphabeticalRailProps) {
  const bodyProps = {
    groups: props.groups,
    filterLabel: props.filterLabel,
    filterPlaceholder: props.filterPlaceholder,
    noResults: props.noResults,
    expandCurrentGroupOnly: props.expandCurrentGroupOnly,
    hashLocation: props.hashLocation,
  };

  return (
    <div className={styles.alphabeticalRail}>
      <nav aria-label={props.railLabel} className={styles.desktopRail}>
        <RailBody {...bodyProps} />
      </nav>
      <details className={styles.mobileRail}>
        <summary className={styles.summary}>
          {props.mobileLabel}
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <nav aria-label={props.railLabel}>
          <RailBody {...bodyProps} />
        </nav>
      </details>
    </div>
  );
}
