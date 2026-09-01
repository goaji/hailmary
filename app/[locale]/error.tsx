"use client"; // error.tsx must be a Client Component (React error boundary)

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import styles from "./error.module.scss";

export default function LocaleError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.description}>{t("description")}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.retryButton} onClick={() => retry()}>
          {t("retry")}
        </button>
        <Link href="/" className={styles.backLink}>
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
