import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import styles from "./TeamBlurb.module.scss";

const HEADING_ID = "team-blurb-heading";

// STUB: no per-team evergreen copy exists yet (no content source, no field
// on Team) — this reserves the section with a generic placeholder rather
// than fabricating 32 team "facts". Swap for real per-team content later.
export async function TeamBlurb() {
  const t = await getTranslations("teamDetail.blurb");

  return (
    <section className={styles.blurb} aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID}>{t("heading")}</SectionHeading>
      <p className={styles.placeholder}>{t("placeholder")}</p>
    </section>
  );
}
