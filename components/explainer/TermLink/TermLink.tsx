"use client"; // hydrates the no-JS anchor into a button that opens the explainer panel

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n";
import {
  useExplainer,
  useExplainerEntry,
  useRegisterArticleTerm,
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
  // Lets the panel offer "other terms in this article" — this is what
  // makes that list correct without parsing article content anywhere: it
  // just reflects whichever TermLink instances are actually mounted.
  useRegisterArticleTerm(term);
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
  // unconditionally, not toggled with visibility. Show/hide on hover is
  // pure CSS :hover (see TermLink.module.scss); the one thing CSS alone
  // can't know is whether a panel is already open, so this element is
  // omitted entirely while any panel is open — once you're looking at the
  // full explanation, a hover preview of it (for this term or any other)
  // is redundant, not an enhancement.
  const tooltip = entry && activeTerm === undefined ? (
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
