import { getTranslations } from "next-intl/server";
import type { Category } from "@/types";
import { CATEGORIES } from "@/utils/categories";
import styles from "./Tag.module.scss";

type TagProps = {
  category: Category;
};

export async function Tag({ category }: TagProps) {
  const t = await getTranslations("categories");
  const definition = CATEGORIES[category];
  const accentStyle =
    definition.accent === 1 ? styles.tagAccent1 : styles.tagAccent2;

  return <span className={`${styles.tag} ${accentStyle}`}>{t(definition.messageKey)}</span>;
}
