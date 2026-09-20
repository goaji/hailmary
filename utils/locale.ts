import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/routing";

/** Narrows a route's `locale` param, 404ing on anything that isn't a configured locale. */
export function requireLocale(value: string): Locale {
  if (!hasLocale(routing.locales, value)) {
    notFound();
  }
  return value;
}

/** Narrows a locale candidate, falling back to the default where a 404 isn't an option (OG images, API routes). */
export function resolveLocale(value: string | null | undefined): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
