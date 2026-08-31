import { getLocale, getTranslations } from "next-intl/server";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import styles from "./Byline.module.scss";

type BylineProps = {
  author: string;
  publishedAt: string;
  /** Article pages only — the homepage's Byline uses don't pass this. */
  readingTimeMinutes?: number;
};

export async function Byline({ author, publishedAt, readingTimeMinutes }: BylineProps) {
  const locale = await getLocale();
  const t = await getTranslations("byline");

  return (
    <p className={styles.byline}>
      {author} · {formatPublishedAt(publishedAt, locale)}
      {readingTimeMinutes !== undefined
        ? ` · ${t("readingTime", { minutes: readingTimeMinutes })}`
        : null}
    </p>
  );
}
