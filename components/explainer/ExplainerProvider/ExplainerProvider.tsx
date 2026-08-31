"use client"; // owns open/close state shared by every TermLink and the panel

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { ExplainerPanel } from "@/components/explainer/ExplainerPanel/ExplainerPanel";
import styles from "./ExplainerProvider.module.scss";

export type ExplainerPanelEntry = {
  slug: string;
  term: string;
  relatedTerms?: string[];
  seeAlso?: string;
  content: ReactNode;
};

type ExplainerContextValue = {
  activeTerm: string | undefined;
  open: (slug: string) => void;
  close: () => void;
};

const ExplainerContext = createContext<ExplainerContextValue | undefined>(undefined);

export function useExplainer(): ExplainerContextValue {
  const context = useContext(ExplainerContext);
  if (!context) {
    throw new Error("useExplainer must be used within an ExplainerProvider");
  }
  return context;
}

type ExplainerProviderProps = {
  entries: ExplainerPanelEntry[];
  children: ReactNode;
};

export function ExplainerProvider({ entries, children }: ExplainerProviderProps) {
  const [activeTerm, setActiveTerm] = useState<string | undefined>(undefined);
  // The element focused when a *fresh* open() happens — deliberately not
  // updated on a swap while the panel is already open, so closing after a
  // second term (a relatedTerms chip, step 4) returns focus to the
  // original triggering word, not whatever swapped it in.
  const triggerRef = useRef<HTMLElement | null>(null);

  function open(slug: string) {
    if (activeTerm === undefined) {
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setActiveTerm(slug);
  }

  function close() {
    setActiveTerm(undefined);
  }

  const activeEntry = entries.find((entry) => entry.slug === activeTerm);

  return (
    <ExplainerContext.Provider value={{ activeTerm, open, close }}>
      {/* data-panel-open drives the <main> margin-shift on desktop — see
          ExplainerProvider.module.scss. main lives inside {children}
          (rendered by the locale layout), not here, so this is a plain
          descendant selector rather than a component this file owns. */}
      <div className={styles.pageShift} data-panel-open={activeEntry ? "" : undefined}>
        {children}
      </div>
      <ExplainerPanel entry={activeEntry} onClose={close} triggerRef={triggerRef} />
    </ExplainerContext.Provider>
  );
}
