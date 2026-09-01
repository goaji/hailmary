"use client"; // not-found.tsx gets no params, so locale can't be read server-side without forcing the route dynamic — this reads it from client context instead

import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import styles from "./not-found.module.scss";

export default function ArticleNotFound() {
  const t = useTranslations("articleNotFound");

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.description}>{t("description")}</p>
      <Link href="/" className={styles.backLink}>
        {t("backHome")}
      </Link>
    </div>
  );
}
