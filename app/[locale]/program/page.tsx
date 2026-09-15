import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { LiveSchedule } from "@/components/schedule/LiveSchedule/LiveSchedule";
import { getAvailableWeeks, getCurrentWeek, getSchedule } from "@/utils/schedule";
import styles from "./page.module.scss";

// Keep this route out of Hostinger's request-time Node path. The week switcher
// is client-side, and ISR refreshes the schedule without requiring dynamic
// rendering.
export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/program">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "schedulePage" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates("/program", [locale])[locale],
      languages: getLanguageAlternates("/program"),
    },
  };
}

export default async function SchedulePage({ params }: PageProps<"/[locale]/program">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "schedulePage" });
  const { games, isLive, updatedAt } = getSchedule();

  return (
    <div className={styles.page}>
      <LiveSchedule
        locale={locale}
        initialGames={games}
        initialIsLive={isLive}
        initialUpdatedAt={updatedAt}
      />
    </div>
  );
}
