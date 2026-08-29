import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLanguageAlternates } from "@/i18n";

export function generateMetadata(): Metadata {
  return {
    alternates: {
      languages: getLanguageAlternates("/"),
    },
  };
}

export default async function Home() {
  const t = await getTranslations("home");

  return <h1>{t("placeholder")}</h1>;
}
