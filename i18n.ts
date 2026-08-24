import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

/**
 * Builds the `alternates.languages` map for a page's `generateMetadata`.
 * `locales` should list only the locales that actually resolve for this
 * page (e.g. omit `en` for `ro`-only news articles).
 */
export function getLanguageAlternates(
  pathname: string,
  locales: readonly Locale[] = routing.locales,
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = getPathname({ href: pathname, locale });
  }

  if (locales.includes(routing.defaultLocale)) {
    languages["x-default"] = languages[routing.defaultLocale];
  }

  return languages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
