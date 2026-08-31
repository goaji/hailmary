"use client"; // IntersectionObserver-driven active-section highlight

import { useEffect, useState } from "react";
import type { ReferenceSection } from "@/types";
import styles from "./RuleToc.module.scss";

type RuleTocProps = {
  sections: ReferenceSection[];
  label: string;
};

export function RuleToc({ sections, label }: RuleTocProps) {
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

  const items = sections.map((section) => (
    <li key={section.id}>
      <a
        href={`#${section.id}`}
        aria-current={section.id === activeId ? "location" : undefined}
        className={styles.link}
      >
        {section.title}
      </a>
    </li>
  ));

  return (
    <>
      <nav aria-label={label} className={styles.desktopToc}>
        <ul className={styles.list}>{items}</ul>
      </nav>

      <details className={styles.mobileToc}>
        <summary className={styles.summary}>
          {label}
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <nav aria-label={label}>
          <ul className={styles.list}>{items}</ul>
        </nav>
      </details>
    </>
  );
}
