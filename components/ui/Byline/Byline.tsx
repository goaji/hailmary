import { getLocale } from "next-intl/server";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import styles from "./Byline.module.scss";

type BylineProps = {
  author: string;
  publishedAt: string;
};

export async function Byline({ author, publishedAt }: BylineProps) {
  const locale = await getLocale();

  return (
    <p className={styles.byline}>
      {author} · {formatPublishedAt(publishedAt, locale)}
    </p>
  );
}
