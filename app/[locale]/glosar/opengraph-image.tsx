import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n";
import { OG_CONTENT_TYPE, OG_FONTS, OG_SIZE, ReferenceOgCard } from "@/utils/og";
import { DEFAULT_TEAM, TEAMS_BY_SLUG } from "@/utils/teams";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tGlossary = await getTranslations({ locale, namespace: "glossary" });
  const team = TEAMS_BY_SLUG[DEFAULT_TEAM];

  return new ImageResponse(
    (
      <ReferenceOgCard
        kicker={tNav("glossary")}
        title={tGlossary("title")}
        accentBar={team.accent1}
        accentText={team.accent2}
      />
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
