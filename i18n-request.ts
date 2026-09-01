import { locale as rootParamLocale } from "next/root-params";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/routing";

// Separate from i18n.ts because next/root-params is Server-Component-only and would break client bundling if mixed with i18n.ts's `Link` export.
export default getRequestConfig(async () => {
  const requested = await rootParamLocale();
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
