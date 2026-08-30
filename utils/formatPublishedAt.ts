const RELATIVE_THRESHOLD_MS = 48 * 60 * 60 * 1000;

/**
 * Relative time ("acum 2 ore") under ~48h, absolute date above it.
 * `now` is injectable so callers (and tests) don't depend on wall-clock time.
 */
export function formatPublishedAt(
  publishedAt: string,
  locale: string,
  now: number = Date.now(),
): string {
  const published = new Date(publishedAt);
  const diffMs = now - published.getTime();

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
