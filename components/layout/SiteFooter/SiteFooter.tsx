import { getLocale, getTranslations } from "next-intl/server";
import styles from "./SiteFooter.module.scss";

export async function SiteFooter() {
  const t = await getTranslations("siteFooter");
  const locale = await getLocale();
  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(new Date());

  return (
    <footer className={styles.siteFooter}>
      <p>{t("copyright", { year })}</p>
      <p className={styles.contact}>
        Email:{" "}
        <a href="mailto:contact@hailmary.ro" className={styles.contactLink}>
          contact@hailmary.ro
        </a>
      </p>
    </footer>
  );
}
