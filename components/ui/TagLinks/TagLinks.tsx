import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import type { Tag } from "@/types";
import styles from "./TagLinks.module.scss";

type TagLinksProps = {
  tags: Tag[];
  /** Accessible name of the list; omit when a surrounding Panel heading already names it. */
  label?: string;
  /** The tag whose page is being viewed. */
  currentTag?: Tag;
};

export async function TagLinks({ tags, label, currentTag }: TagLinksProps) {
  const t = await getTranslations("tags");

  return (
    <ul className={styles.tagLinks} aria-label={label}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/etichete/${tag}`}
            aria-current={tag === currentTag ? "page" : undefined}
            className={styles.link}
          >
            {t(tag)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
