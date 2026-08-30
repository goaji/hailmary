import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Bebas_Neue, Work_Sans } from "next/font/google";
import { routing } from "@/i18n";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { TeamColorProvider } from "@/components/layout/TeamColorProvider/TeamColorProvider";
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

  return (
    <html lang={locale} className={`${bebasNeue.variable} ${workSans.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <TeamColorProvider>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </TeamColorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
