"use client"; // localStorage-backed dismissal state

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import styles from "./OriginStrip.module.scss";

const DISMISS_KEY = "hm.strip";

export function OriginStrip() {
  const t = useTranslations("originStrip");
  const [isDismissed, setIsDismissed] = useState(false);

  // React state still syncs in an effect (avoids a hydration mismatch) —
  // but that alone measured 0.22 CLS for returning visitors (the strip
  // painting, then disappearing). The inline script below hides it
  // synchronously during HTML parsing, before first paint, so by the time
  // this effect runs the element already has zero footprint to remove.
  useEffect(() => {
    const stored = window.localStorage.getItem(DISMISS_KEY);
    if (stored === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDismissed(true);
    }
  }, []);

  function dismiss() {
    setIsDismissed(true);
    window.localStorage.setItem(DISMISS_KEY, "true");
  }

  if (isDismissed) {
    return null;
  }

  return (
    <div className={styles.strip} id="origin-strip">
      {/* Static string, no user input. Runs synchronously pre-hydration to prevent the flash/CLS a React effect can't avoid. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `if(localStorage.getItem(${JSON.stringify(DISMISS_KEY)})==="true"){document.getElementById("origin-strip").style.display="none"}`,
        }}
      />
      <div className={styles.copy}>
        <p className={styles.kicker}>{t("kicker")}</p>
        <p className={styles.story}>
          <span className={`${styles.phrase} ${styles.phrase1}`}>{t("phrase1")}</span>
          <span className={`${styles.phrase} ${styles.phrase2}`}>{t("phrase2")}</span>
          <span className={`${styles.phrase} ${styles.phrase3}`}>{t("phrase3")}</span>
          <span className={`${styles.phrase} ${styles.phrase4}`}>{t("phrase4")}</span>
        </p>
      </div>

      <div className={styles.actions}>
        <Link href="/istorie/hail-mary" className={styles.readLink}>
          {t("readMore")}
          <span aria-hidden="true"> ›</span>
        </Link>
        <button
          type="button"
          className={styles.dismissButton}
          aria-label={t("dismiss")}
          onClick={dismiss}
        >
          <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
            <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
