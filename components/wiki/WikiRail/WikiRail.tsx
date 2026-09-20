import { getTranslations } from "next-intl/server";
import { WikiRailTree } from "@/components/wiki/WikiRail/WikiRailTree";
import type { Locale, ReferenceSection, WikiStrandGroup, WikiStrandId } from "@/types";
import styles from "./WikiRail.module.scss";

type WikiRailProps = {
  tree: WikiStrandGroup[];
  currentStrand: WikiStrandId;
  currentSlug: string;
  /** The current page's sections — rendered as a nested "subchapter" list under its own rail entry, only when there's more than one. */
  currentPageSections: ReferenceSection[];
  locale: Locale;
};

// Translations only resolve server-side, so this stays a server component; the interactive expand/collapse state lives in the client WikiRailTree below it.
export async function WikiRail({
  tree,
  currentStrand,
  currentSlug,
  currentPageSections,
  locale,
}: WikiRailProps) {
  const t = await getTranslations({ locale, namespace: "wikiRail" });
  const tStrands = await getTranslations({ locale, namespace: "wikiStrands" });

  const strands = tree
    .filter((group) => group.pages.length > 0)
    .map((group) => ({
      strand: group.strand,
      name: tStrands(`${group.strand}.name`),
      pages: group.pages.map((page) => ({ slug: page.slug, title: page.frontmatter.title })),
    }));

  return (
    <div className={styles.wikiRail}>
      <nav aria-label={t("label")} className={styles.desktopRail}>
        <WikiRailTree
          strands={strands}
          currentStrand={currentStrand}
          currentSlug={currentSlug}
          currentPageSections={currentPageSections}
        />
      </nav>

      <details className={styles.mobileRail}>
        <summary className={styles.summary}>
          {t("mobileLabel")}
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <nav aria-label={t("label")}>
          <WikiRailTree
            strands={strands}
            currentStrand={currentStrand}
            currentSlug={currentSlug}
            currentPageSections={currentPageSections}
          />
        </nav>
      </details>
    </div>
  );
}
