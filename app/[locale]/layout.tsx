import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Bebas_Neue, Work_Sans } from "next/font/google";
import { routing } from "@/i18n";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { TeamColorProvider } from "@/components/layout/TeamColorProvider/TeamColorProvider";
import { ExplainerProvider } from "@/components/explainer/ExplainerProvider/ExplainerProvider";
import { ExplainerContent } from "@/components/explainer/ExplainerContent/ExplainerContent";
import { getAllTerms } from "@/utils/glossary";
import "../../styles/globals.scss";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://hailmary.ro"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  // Entries are bundled at build/request time and handed to the client
  // provider as inert, pre-rendered content (extended MDX compiled once,
  // here) — the panel never fetches on open.
  const explainerEntries = getAllTerms(locale).map((entry) => ({
    slug: entry.slug,
    term: entry.term,
    relatedTerms: entry.relatedTerms,
    seeAlso: entry.seeAlso,
    content: <ExplainerContent content={entry.extended} />,
  }));

  return (
    <html lang={locale} className={`${bebasNeue.variable} ${workSans.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <TeamColorProvider>
            <ExplainerProvider entries={explainerEntries}>
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
