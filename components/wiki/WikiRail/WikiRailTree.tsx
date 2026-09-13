"use client"; // accordion expand/collapse state, decoupled from routing

import { useId, useState } from "react";
import { Link } from "@/i18n";
import { WikiPageToc } from "@/components/wiki/WikiRail/WikiPageToc";
import type { ReferenceSection, WikiStrandId } from "@/types";
import styles from "./WikiRail.module.scss";

export type WikiRailTreeStrand = {
  strand: WikiStrandId;
  /** Already translated — this component takes plain strings, no next-intl (client component, but no interactive-translation need either). */
  name: string;
  pages: Array<{ slug: string; title: string }>;
};

type WikiRailTreeProps = {
  strands: WikiRailTreeStrand[];
  currentStrand: WikiStrandId;
  currentSlug: string;
  currentPageSections: ReferenceSection[];
};

// Accordion, decoupled from navigation: expanding a strand only reveals its pages, it never moves you off the page you're reading.
export function WikiRailTree({ strands, currentStrand, currentSlug, currentPageSections }: WikiRailTreeProps) {
  // WikiRail mounts this component twice (desktop nav + mobile details) —
  // ids built from data alone would collide across both instances, which
  // is invalid HTML and breaks aria-controls. useId() is per-instance and
  // SSR-safe, so each mount gets its own id namespace.
  const instanceId = useId();
  const [expandedStrand, setExpandedStrand] = useState<WikiStrandId | undefined>(currentStrand);
  // The current page's own subchapter list is independently collapsible —
  // same idea as the strand toggle, one level deeper. Starts open so
  // landing on a page shows its sections right away.
  const [isTocOpen, setIsTocOpen] = useState(true);
  const hasToc = currentPageSections.length > 1;

  return (
    <ul className={styles.strandList}>
      {strands.map((strand) => {
        const isExpanded = strand.strand === expandedStrand;
        const isCurrentStrand = strand.strand === currentStrand;
        const pageListId = `${instanceId}-pages-${strand.strand}`;

        return (
          <li key={strand.strand} className={styles.strandItem}>
            <button
              type="button"
              className={isCurrentStrand ? `${styles.strandButton} ${styles.current}` : styles.strandButton}
              aria-expanded={isExpanded}
              aria-controls={pageListId}
              onClick={() =>
                setExpandedStrand((previous) => (previous === strand.strand ? undefined : strand.strand))
              }
            >
              {strand.name}
              <span className={styles.strandChevron} aria-hidden="true" />
            </button>

            {isExpanded ? (
              <ul id={pageListId} className={styles.pageList}>
                {strand.pages.map((page) => {
                  const isCurrentPage = isCurrentStrand && page.slug === currentSlug;
                  const tocId = `${instanceId}-toc-${page.slug}`;

                  return (
                    <li key={page.slug}>
                      {isCurrentPage && hasToc ? (
                        <button
                          type="button"
                          className={styles.pageToggle}
                          aria-expanded={isTocOpen}
                          aria-controls={tocId}
                          aria-current="page"
                          onClick={() => setIsTocOpen((open) => !open)}
                        >
                          {page.title}
                          <span className={styles.pageChevron} aria-hidden="true" />
                        </button>
                      ) : isCurrentPage ? (
                        <span className={styles.pageLinkActive} aria-current="page">
                          {page.title}
                        </span>
                      ) : (
                        <Link href={`/wiki/${strand.strand}/${page.slug}`} className={styles.pageLink}>
                          {page.title}
                        </Link>
                      )}
                      {isCurrentPage && hasToc && isTocOpen ? (
                        <div id={tocId}>
                          <WikiPageToc sections={currentPageSections} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
