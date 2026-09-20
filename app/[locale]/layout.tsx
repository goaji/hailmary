import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Sofia_Sans_Condensed, Work_Sans } from "next/font/google";
import Script from "next/script";
import { routing } from "@/i18n";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { HeaderHeightVar } from "@/components/layout/HeaderHeightVar/HeaderHeightVar";
import { TeamColorProvider } from "@/components/layout/TeamColorProvider/TeamColorProvider";
import { ExplainerProvider } from "@/components/explainer/ExplainerProvider/ExplainerProvider";
import { ExplainerContent } from "@/components/explainer/ExplainerContent/ExplainerContent";
import { getAllTerms } from "@/utils/glossary";
import { SITE_URL } from "@/utils/site";
import { HEADER_BG, teamSurfaceVars } from "@/utils/theme";
import { TEAMS } from "@/utils/teams";
import { STORAGE_KEY } from "@/components/layout/TeamColorProvider/teamColorConstants";
import { requireLocale } from "@/utils/locale";
import { DISMISS_KEY, STRIP_ID } from "@/components/home/OriginStrip/originStripConstants";
import "../../styles/globals.scss";

// "latin" alone silently drops ă/â/î/ș/ț — latin-ext is required too, alongside it (its own range excludes plain ASCII).
// Only 700 is loaded, so every display element renders bold whatever font-weight it asks for.
const sofiaSansCondensed = Sofia_Sans_Condensed({
  weight: "700",
  variable: "--font-sofia-sans-condensed",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const workSans = Work_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: HEADER_BG,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(SITE_URL),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = requireLocale((await params).locale);

  const messages = await getMessages();

  // Every team's tinted surfaces, so the pre-paint script below can look one up without shipping the color math.
  const teamSurfaces = Object.fromEntries(
    TEAMS.map((team) => [team.slug, teamSurfaceVars(team.accent1)]),
  );

  // Entries are bundled at build/request time and handed to the client
  // provider as inert, pre-rendered content (extended MDX compiled once,
  // here) — the panel never fetches on open.
  const explainerEntries = getAllTerms(locale).map((entry) => ({
    slug: entry.slug,
    term: entry.term,
    short: entry.short,
    relatedTerms: entry.relatedTerms,
    isFallback: entry.servedLocale !== locale,
    content: <ExplainerContent content={entry.extended} />,
  }));

  return (
    // suppressHydrationWarning: the tint script below writes a style attribute here before React hydrates, which is a mismatch by definition.
    <html
      lang={locale}
      className={`${sofiaSansCondensed.variable} ${workSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Lives here, not in OriginStrip, so it runs before hydration and the dismissed strip never flashes. */}
        <Script
          id="origin-strip-hide"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `if(localStorage.getItem(${JSON.stringify(DISMISS_KEY)})==="true"){var el=document.getElementById(${JSON.stringify(STRIP_ID)});if(el)el.style.display="none"}`,
          }}
        />
        {/* Applies the stored team's tint before first paint, so the default team's background never flashes. A plain inline script, not next/script: even
            beforeInteractive is executed by Next's loader after paint, which is exactly the flash this prevents. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=${JSON.stringify(teamSurfaces)}[localStorage.getItem(${JSON.stringify(STORAGE_KEY)})];if(s)for(var k in s)document.documentElement.style.setProperty(k,s[k])})()`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <TeamColorProvider>
            <ExplainerProvider entries={explainerEntries}>
              <HeaderHeightVar />
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </ExplainerProvider>
          </TeamColorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
