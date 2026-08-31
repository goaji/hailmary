"use client"; // owns open/close state shared by every TermLink and the panel

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ExplainerPanel } from "@/components/explainer/ExplainerPanel/ExplainerPanel";
import styles from "./ExplainerProvider.module.scss";

export type ExplainerPanelEntry = {
  slug: string;
  term: string;
  short: string;
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

// Deliberately a *separate* context from ExplainerContext above: the spec
// pins {activeTerm, open, close} down as the panel's interaction state,
// but the bundled entries (needed by TermLink's hover tooltip, for its
// `short`) are static content, not state — keeping them apart means
// useExplainer() stays exactly the three-key shape the spec describes.
const ExplainerEntriesContext = createContext<ExplainerPanelEntry[]>([]);

export function useExplainerEntry(slug: string): ExplainerPanelEntry | undefined {
  const entries = useContext(ExplainerEntriesContext);
  return entries.find((entry) => entry.slug === slug);
}

// Which terms are actually tagged on the *current* page — not parsed from
// article content server-side, but built from whichever TermLink
// instances happen to be mounted right now. That means it's automatically
// correct on every article without any page wiring, and stays correct
// across a client-side navigation to a different article (the old page's
// TermLinks unmount and unregister, the new page's mount and register).
// A count, not a Set, so two uses of the same term in one article don't
// let the first one's unmount evict it while the second is still mounted.
type ArticleTermsContextValue = {
  registerTerm: (slug: string) => void;
  unregisterTerm: (slug: string) => void;
};

const ArticleTermsContext = createContext<ArticleTermsContextValue | undefined>(undefined);
const ArticleTermsListContext = createContext<string[]>([]);

export function useRegisterArticleTerm(slug: string): void {
  const context = useContext(ArticleTermsContext);
  useEffect(() => {
    if (!context) {
      return;
    }
    context.registerTerm(slug);
    return () => context.unregisterTerm(slug);
  }, [context, slug]);
}

// The list, in first-registered order — for a linear MDX body that's the
// order the reader actually encounters each term in.
export function useArticleTerms(): string[] {
  return useContext(ArticleTermsListContext);
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

  const [termCounts, setTermCounts] = useState<Map<string, number>>(new Map());

  // useCallback (stable across renders, since setTermCounts itself is
  // stable) + useMemo on the context value object below: without both,
  // useRegisterArticleTerm's effect would see a new {registerTerm,
  // unregisterTerm} object every render, re-run every render, and each
  // run's registerTerm() call would setState — a real infinite loop, not
  // a hypothetical one (caught by testing, not by inspection).
  const registerTerm = useCallback((slug: string) => {
    setTermCounts((prev) => {
      const next = new Map(prev);
      next.set(slug, (next.get(slug) ?? 0) + 1);
      return next;
    });
  }, []);

  const unregisterTerm = useCallback((slug: string) => {
    setTermCounts((prev) => {
      const next = new Map(prev);
      const count = (next.get(slug) ?? 1) - 1;
      if (count <= 0) {
        next.delete(slug);
      } else {
        next.set(slug, count);
      }
      return next;
    });
  }, []);

  const articleTermsContextValue = useMemo(
    () => ({ registerTerm, unregisterTerm }),
    [registerTerm, unregisterTerm],
  );
  const articleTermsList = useMemo(() => [...termCounts.keys()], [termCounts]);

  // Deep link (spec section 9): a shared ?termen=<slug> URL opens that
  // panel once on load, via the same open() a click would use. An
  // unknown or missing slug is silently ignored, never thrown. Runs once
  // on mount only, not on every subsequent client-side navigation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("termen");
    if (slug && entries.some((entry) => entry.slug === slug)) {
      // Safe here: which term (if any) the URL names has no other source
      // of truth to derive from during render — the query string can only
      // be read inside an effect. One-time sync on mount, not recomputed
      // on every render, so it doesn't cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      open(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps ?termen= in sync with activeTerm on every open/swap/close —
  // always replaceState, never push, so the back button doesn't fill up
  // with one entry per term.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTerm) {
      url.searchParams.set("termen", activeTerm);
    } else {
      url.searchParams.delete("termen");
    }
    window.history.replaceState(null, "", url);
  }, [activeTerm]);

  return (
    <ExplainerEntriesContext.Provider value={entries}>
      <ArticleTermsContext.Provider value={articleTermsContextValue}>
        <ArticleTermsListContext.Provider value={articleTermsList}>
          <ExplainerContext.Provider value={{ activeTerm, open, close }}>
            {/* data-panel-open drives the <main> margin-shift on desktop
                — see ExplainerProvider.module.scss. main lives inside
                {children} (rendered by the locale layout), not here, so
                this is a plain descendant selector rather than a
                component this file owns. */}
            <div className={styles.pageShift} data-panel-open={activeTerm ? "" : undefined}>
              {children}
            </div>
            <ExplainerPanel entries={entries} triggerRef={triggerRef} />
          </ExplainerContext.Provider>
        </ArticleTermsListContext.Provider>
      </ArticleTermsContext.Provider>
    </ExplainerEntriesContext.Provider>
  );
}
