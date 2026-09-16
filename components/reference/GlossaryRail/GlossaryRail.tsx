import { useTranslations } from "next-intl";
import { AlphabeticalRail } from "@/components/ui/AlphabeticalRail/AlphabeticalRail";

export type GlossaryRailTerm = {
  slug: string;
  term: string;
  letter: string;
};

type GlossaryRailProps = {
  /** Every letter with at least one term, sorted. */
  letters: string[];
  /** The letter of the page this rail is rendered on. */
  currentLetter: string;
  /** Every term, across all letters — search matches the whole glossary. */
  allTerms: GlossaryRailTerm[];
};

export function GlossaryRail(props: GlossaryRailProps) {
  const t = useTranslations("glossary");
  const groups = props.letters.map((letter) => ({
    letter,
    href: `/glosar/${letter.toLowerCase()}`,
    current: letter === props.currentLetter,
    items: props.allTerms
      .filter((term) => term.letter === letter)
      .map((term) => ({ id: term.slug, label: term.term, href: `#${term.slug}` })),
  }));

  return (
    <AlphabeticalRail
      groups={groups}
      filterLabel={t("filterLabel")}
      filterPlaceholder={t("filterPlaceholder")}
      noResults={t("noResults")}
      railLabel={t("railLabel")}
      mobileLabel={t("railMobileLabel")}
      expandCurrentGroupOnly
      hashLocation
    />
  );
}
