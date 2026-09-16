import { useTranslations } from "next-intl";
import type { Tag } from "@/types";
import { AlphabeticalRail } from "@/components/ui/AlphabeticalRail/AlphabeticalRail";

type TagRailProps = {
  tags: Tag[];
  currentTag: Tag;
};

export function TagRail({ tags, currentTag }: TagRailProps) {
  const tTags = useTranslations("tags");
  const tGlossary = useTranslations("glossary");
  const tArticleBody = useTranslations("articleBody");
  const groups = [...new Set(tags.map((tag) => tTags(tag).charAt(0).toUpperCase()))]
    .sort((first, second) => first.localeCompare(second))
    .map((letter) => ({
      letter,
      items: tags
        .filter((tag) => tTags(tag).charAt(0).toUpperCase() === letter)
        .map((tag) => ({
          id: tag,
          label: tTags(tag),
          href: `/etichete/${tag}`,
          current: tag === currentTag,
        })),
    }));

  return (
    <AlphabeticalRail
      groups={groups}
      filterLabel={tArticleBody("tagsLabel")}
      filterPlaceholder={tGlossary("filterPlaceholder")}
      noResults={tGlossary("noResults")}
      railLabel={tArticleBody("tagsLabel")}
      mobileLabel={tGlossary("railMobileLabel")}
    />
  );
}
