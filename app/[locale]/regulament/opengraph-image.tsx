import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n";
import { getReferencePage } from "@/utils/reference";
import { OG_CONTENT_TYPE, OG_FONTS, OG_SIZE, ReferenceOgCard } from "@/utils/og";
import { DEFAULT_TEAM, TEAMS_BY_SLUG } from "@/utils/teams";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const SLUG = "regulament";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const page = getReferencePage(SLUG, locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  const team = TEAMS_BY_SLUG[DEFAULT_TEAM];

  return new ImageResponse(
    (
      <ReferenceOgCard
        kicker={t("rules")}
        title={page?.frontmatter.title ?? t("rules")}
        accentBar={team.accent1}
        accentText={team.accent2}
      />
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
