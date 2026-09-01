import { createNavigation } from "next-intl/navigation";
import { routing } from "@/routing";
import type { Locale } from "@/routing";

export { routing };
export type { Locale };

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
