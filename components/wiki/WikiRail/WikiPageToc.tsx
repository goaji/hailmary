"use client"; // IntersectionObserver-driven active-section highlight

import { useEffect, useState } from "react";
import type { ReferenceSection } from "@/types";
import styles from "./WikiRail.module.scss";

type WikiPageTocProps = {
  sections: ReferenceSection[];
};

// Rendered nested under the current page's rail entry — a floating position: sticky box here pinned over the article on scroll instead.
export function WikiPageToc({ sections }: WikiPageTocProps) {
  const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) {
      return;
    }

    // A callback only reports what just changed, not everything currently intersecting — track that in a running Set instead.
    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target.id);
          } else {
            intersecting.delete(entry.target.id);
          }
        }

        const active = sections.find((section) => intersecting.has(section.id));
        if (active) {
          setActiveId(active.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [sections]);

  return (
    <ul className={styles.sectionList}>
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            aria-current={section.id === activeId ? "location" : undefined}
            className={styles.sectionLink}
          >
            {section.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
