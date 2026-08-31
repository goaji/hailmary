"use client"; // hydrates the no-JS anchor into a button that opens the explainer panel

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n";
import {
  useExplainer,
  useExplainerEntry,
} from "@/components/explainer/ExplainerProvider/ExplainerProvider";
import styles from "./TermLink.module.scss";

type TermLinkProps = {
  term: string;
  children: ReactNode;
};

export function TermLink({ term, children }: TermLinkProps) {
  const { activeTerm, open } = useExplainer();
  const entry = useExplainerEntry(term);
  const isActive = activeTerm === term;
  // The server (and so the first client render, to avoid a hydration
  // mismatch) has no way to know JS will run, so it always renders the
  // no-JS anchor — this flips to true right after mount, swapping to the
  // interactive <button>. The gap is one paint, not something a reader
  // perceives.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Safe here: isHydrated has no other source of truth to derive from
    // during render — whether we're past the first client paint can only
    // be known inside an effect. One-time sync on mount, not a value
    // recomputed on every render, so it doesn't cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const className = isActive ? `${styles.termLink} ${styles.active}` : styles.termLink;

  // Presentational only, decorative and duplicative of the trigger's own
  // accessible name plus the panel's full explanation — aria-hidden
  // unconditionally, not toggled with visibility. Pure CSS :hover (see
  // TermLink.module.scss) drives show/hide, so this needs no JS at all
  // and renders identically before and after hydration — including with
  // JS disabled entirely, where it's a harmless bonus, not a requirement.
  const tooltip = entry ? (
    <span className={styles.tooltip} aria-hidden="true">
      {entry.short}
    </span>
  ) : null;

  if (!isHydrated) {
    return (
      <Link href={`/glosar#${term}`} className={className}>
        {children}
        {tooltip}
      </Link>
    );
  }

  return (
    <button type="button" className={className} aria-expanded={isActive} onClick={() => open(term)}>
      {children}
      {tooltip}
    </button>
  );
}
