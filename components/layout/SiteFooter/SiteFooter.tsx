import { getLocale, getTranslations } from "next-intl/server";
import styles from "./SiteFooter.module.scss";

export async function SiteFooter() {
  const t = await getTranslations("siteFooter");
  const locale = await getLocale();
  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(
    new Date(),
  );

  return (
    <footer className={styles.footer}>
      <p>{t("copyright", { year })}</p>
    </footer>
  );
}
