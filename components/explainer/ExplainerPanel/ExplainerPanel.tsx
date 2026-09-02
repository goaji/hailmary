"use client"; // owns the native <dialog> imperative lifecycle, focus and Escape/backdrop handling

import { useEffect, useId, useRef, type RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  useArticleTerms,
  useExplainer,
  type ExplainerPanelEntry,
} from "@/components/explainer/ExplainerProvider/ExplainerProvider";
import { FallbackNotice } from "@/components/ui/FallbackNotice/FallbackNotice";
import type { Locale } from "@/types";
import styles from "./ExplainerPanel.module.scss";

type ExplainerPanelProps = {
  entries: ExplainerPanelEntry[];
  triggerRef: RefObject<HTMLElement | null>;
};

// <dialog> + showModal(): native focus trap and Escape-to-close, safer than hand-rolling the a11y risk TASK-6 flags.
export function ExplainerPanel({ entries, triggerRef }: ExplainerPanelProps) {
  const t = useTranslations("explainerPanel");
  const locale = useLocale() as Locale; // next-intl types this as string; always one of routing.locales
  const { activeTerm, open, close } = useExplainer();
  const entry = entries.find((candidate) => candidate.slug === activeTerm);
  const articleTerms = useArticleTerms();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  // Same effect handles a fresh open and a swap — dialog.open guards against re-opening; focus always goes to the new heading, never triggerRef.
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

  // Every close path ends in dialog.close(), which fires 'close' — the one place state syncs back and focus returns to the trigger.
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

  // Contextual (tagged on this page) vs relatedTerms' editorial curation — excludes duplicates between the two groups.
  const relatedSlugs = new Set(relatedEntries.map((related) => related.slug));
  const articleEntries = articleTerms
    .filter((slug) => slug !== activeTerm && !relatedSlugs.has(slug))
    .map((slug) => entries.find((candidate) => candidate.slug === slug))
    .filter((candidate) => candidate !== undefined);

  return (
    <dialog
      ref={dialogRef}
      className={styles.panel}
      aria-labelledby={headingId}
      onClick={(event) => {
        // A click on ::backdrop is indistinguishable from a click on the dialog element itself.
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
            {entry.isFallback ? (
              <FallbackNotice locale={locale}>{t("fallbackNotice")}</FallbackNotice>
            ) : null}
            {entry.content}

            {relatedEntries.length > 0 || articleEntries.length > 0 ? (
              <div className={styles.footer}>
                {relatedEntries.length > 0 ? (
                  <div className={styles.chipGroup}>
                    <p className={styles.chipGroupLabel}>{t("relatedTerms")}</p>
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
                  </div>
                ) : null}
                {articleEntries.length > 0 ? (
                  <div className={styles.chipGroup}>
                    <p className={styles.chipGroupLabel}>{t("otherTermsInArticle")}</p>
                    <div className={styles.chips}>
                      {articleEntries.map((related) => (
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
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
