"use client"; // owns the native <dialog> imperative lifecycle, focus and Escape/backdrop handling

import { useEffect, useId, useRef, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import {
  useExplainer,
  type ExplainerPanelEntry,
} from "@/components/explainer/ExplainerProvider/ExplainerProvider";
import styles from "./ExplainerPanel.module.scss";

type ExplainerPanelProps = {
  entries: ExplainerPanelEntry[];
  triggerRef: RefObject<HTMLElement | null>;
};

// <dialog> + showModal() over a hand-rolled role="dialog" div: the focus
// trap and Escape-to-close come from the platform, tested across browsers
// and screen readers, rather than a hand-rolled version of the exact thing
// TASK-6 calls out as the real a11y risk here. It also puts the panel in
// the top layer for free, so it's never clipped by an ancestor's overflow.
// The one thing the platform doesn't hand us is the desktop non-covering
// layout (a modal's default is to cover), so that's done explicitly below:
// ::backdrop goes transparent at the panel breakpoint (still closes on
// click, just doesn't dim the now-visible article), and the corresponding
// <main> shift lives in ExplainerProvider.
export function ExplainerPanel({ entries, triggerRef }: ExplainerPanelProps) {
  const t = useTranslations("explainerPanel");
  const { activeTerm, open, close } = useExplainer();
  const entry = entries.find((candidate) => candidate.slug === activeTerm);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  // React state -> imperative show/close, and focus follows: on a fresh
  // open the dialog wasn't open yet, so this opens it; on a swap (entry
  // changes while already open, e.g. a relatedTerms chip below) it's a
  // no-op past the `!dialog.open` check, so content just re-renders in
  // place. Either way the heading gets focus, which is what makes the "no
  // focus jump back to the old trigger" swap case work — focus moves to
  // the *new* heading, not back to triggerRef, which only close() below
  // ever reads.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (entry) {
      if (!dialog.open) {
        dialog.showModal();
      }
      headingRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [entry]);

  // The single place every close path funnels through: Escape (browser-
  // native), the close button and the backdrop click below both call
  // dialog.close() directly, and closing via context (e.g. TermLink
  // toggling itself off, later) hits the effect above, which also calls
  // dialog.close(). close() firing 'close' is itself part of the dialog
  // spec, not something wired up per call site, so this is the one spot
  // that needs to sync context state back and restore focus, however the
  // close happened.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    function handleClose() {
      close();
      triggerRef.current?.focus();
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [close, triggerRef]);

  const relatedEntries = (entry?.relatedTerms ?? [])
    .map((slug) => entries.find((candidate) => candidate.slug === slug))
    .filter((candidate) => candidate !== undefined);

  return (
    <dialog
      ref={dialogRef}
      className={styles.panel}
      aria-labelledby={headingId}
      onClick={(event) => {
        // A click on ::backdrop is indistinguishable from a click on the
        // dialog element itself — content clicks stop here before they
        // reach this handler.
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
    >
      {entry ? (
        <>
          <div className={styles.header}>
            <h2 id={headingId} ref={headingRef} tabIndex={-1} className={styles.heading}>
              {entry.term}
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              aria-label={t("close")}
              onClick={() => dialogRef.current?.close()}
            >
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <line
                  x1="4"
                  y1="4"
                  x2="16"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="4"
                  x2="4"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className={styles.content}>
            {entry.content}

            {relatedEntries.length > 0 || entry.seeAlso ? (
              <div className={styles.footer}>
                {relatedEntries.length > 0 ? (
                  // Buttons: swap the panel's own content in place — a
                  // second, different affordance from seeAlso below, which
                  // navigates away entirely.
                  <div className={styles.chips}>
                    {relatedEntries.map((related) => (
                      <button
                        key={related.slug}
                        type="button"
                        className={styles.chip}
                        onClick={() => open(related.slug)}
                      >
                        {related.term}
                      </button>
                    ))}
                  </div>
                ) : null}
                {entry.seeAlso ? (
                  <Link href={entry.seeAlso} className={styles.seeAlso}>
                    {t("seeAlso")}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
