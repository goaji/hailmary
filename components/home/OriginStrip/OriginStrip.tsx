"use client"; // localStorage-backed dismissal state

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import styles from "./OriginStrip.module.scss";

const DISMISS_KEY = "hm.strip";

export function OriginStrip() {
  const t = useTranslations("originStrip");
  const [isDismissed, setIsDismissed] = useState(false);

  // Read in an effect, not during render: avoids a hydration mismatch,
  // at the cost of one visible frame of the strip for returning visitors.
  // Same set-state-in-effect exception as TeamColorProvider.
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
    <div className={styles.strip}>
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
        <Link href="/istorie" className={styles.readLink}>
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
