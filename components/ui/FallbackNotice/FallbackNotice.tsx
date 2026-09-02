import type { ReactNode } from "react";
import type { Locale } from "@/types";
import styles from "./FallbackNotice.module.scss";

type FallbackNoticeProps = {
  /** The locale the notice text itself is in (the reader's requested locale) — never the served (ro) content's locale. */
  locale: Locale;
  children: ReactNode;
};

// Shared by every ro-fallback view (an article, the homepage, /stiri):
// content is served in ro while this banner stays in the reader's own
// locale — never a silent language switch.
export function FallbackNotice({ locale, children }: FallbackNoticeProps) {
  return (
    <p className={styles.notice} role="status" lang={locale}>
      {children}
    </p>
  );
}
