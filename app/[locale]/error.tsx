"use client"; // error.tsx must be a Client Component (React error boundary)

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { StatusPanel } from "@/components/layout/StatusPanel/StatusPanel";
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
    <StatusPanel
      title={t("title")}
      description={t("description")}
      backHref="/"
      backLabel={t("backHome")}
    >
      <button type="button" className={styles.retryButton} onClick={() => retry()}>
        {t("retry")}
      </button>
    </StatusPanel>
  );
}
