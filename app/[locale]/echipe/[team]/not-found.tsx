import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import styles from "./not-found.module.scss";

export default async function TeamNotFound() {
  const t = await getTranslations("teamNotFound");

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.description}>{t("description")}</p>
      <Link href="/echipe" className={styles.backLink}>
        {t("backToTeams")}
      </Link>
    </div>
  );
}
