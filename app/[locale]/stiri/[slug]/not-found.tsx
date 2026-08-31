import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import styles from "./not-found.module.scss";

export default async function ArticleNotFound() {
  const t = await getTranslations("articleNotFound");

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
