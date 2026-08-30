import { defineRouting } from "next-intl/routing";

// Kept separate from i18n.ts deliberately: i18n.ts calls createNavigation(),
// which pulls in next/navigation — fine in app code, but that's a real
// Next.js runtime module unavailable in plain Node (Vitest). Server-only
// data files that just need `routing`/`Locale` (no Link/useRouter/etc.)
// should import from here, not from `@/i18n`.
export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
