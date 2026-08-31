import type { ReactNode } from "react";
import { Link } from "@/i18n";
import styles from "./TermLink.module.scss";

type TermLinkProps = {
  term: string;
  children: ReactNode;
};

// No-JS baseline (spec section 9 "Degradation"): this is the SSR output
// and the only markup this step produces. It hydrates into a <button> with
// a click-opened panel in a later step; until then, the anchor to
// /glosar#<slug> IS the feature.
export function TermLink({ term, children }: TermLinkProps) {
  return (
    <Link href={`/glosar#${term}`} className={styles.termLink}>
      {children}
    </Link>
  );
}
