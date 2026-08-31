import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./ReferenceLinks.module.scss";

const HEADING_ID = "reference-links-heading";

type ReferenceLinksItem = {
  label: string;
  href: string;
};

type ReferenceLinksProps = {
  items: ReferenceLinksItem[];
};

export async function ReferenceLinks({ items }: ReferenceLinksProps) {
  if (items.length === 0) {
    return null;
  }

  const t = await getTranslations("referenceLinks");

  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
