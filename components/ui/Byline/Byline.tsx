import { getLocale } from "next-intl/server";
import styles from "./Byline.module.scss";

type BylineProps = {
  author: string;
  publishedAt: string;
};

const RELATIVE_THRESHOLD_MS = 48 * 60 * 60 * 1000;

function formatPublishedAt(publishedAt: string, locale: string): string {
  const published = new Date(publishedAt);
  const diffMs = Date.now() - published.getTime();

  if (diffMs < RELATIVE_THRESHOLD_MS) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const diffMinutes = Math.round(diffMs / 60_000);
    const diffHours = Math.round(diffMs / 3_600_000);

    if (diffMinutes < 60) {
      return rtf.format(-diffMinutes, "minute");
    }
    if (diffHours < 24) {
      return rtf.format(-diffHours, "hour");
    }
    return rtf.format(-Math.round(diffHours / 24), "day");
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(published);
}

export async function Byline({ author, publishedAt }: BylineProps) {
  const locale = await getLocale();

  return (
    <p className={styles.byline}>
      {author} · {formatPublishedAt(publishedAt, locale)}
    </p>
  );
}
