import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, Link, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { ScheduleTable } from "@/components/schedule/ScheduleTable/ScheduleTable";
import { getAvailableWeeks, getCurrentWeek, getSchedule } from "@/utils/schedule";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import styles from "./page.module.scss";

// Reading searchParams (the week filter) opts this page into per-request
// dynamic rendering, so there's no `export const revalidate` here — it
// wouldn't apply. That's fine: the only work each request does is read
// the local score store (utils/store.ts), never the third-party API, so
// there's nothing expensive to cache against.

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
      languages: getLanguageAlternates("/program"),
    },
  };
}

export default async function SchedulePage({
  params,
  searchParams,
}: PageProps<"/[locale]/program">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations("schedulePage");
  const { games, isLive, updatedAt } = getSchedule();

  const weeks = getAvailableWeeks(games);
  const { etapa } = await searchParams;
  const requestedWeek = Array.isArray(etapa) ? etapa[0] : etapa;
  const parsedWeek = requestedWeek ? Number.parseInt(requestedWeek, 10) : NaN;
  const selectedWeek =
    Number.isInteger(parsedWeek) && weeks.includes(parsedWeek) ? parsedWeek : getCurrentWeek(games);

  const weekGames = games.filter((game) => game.week === selectedWeek);

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>

      {!isLive && <p className={styles.notice}>{t("liveUnavailableNotice")}</p>}

      {weeks.length > 1 && (
        <nav aria-label={t("weekNavLabel")} className={styles.weekNav}>
          <ul className={styles.weekList}>
            {weeks.map((week) => (
              <li key={week}>
                <Link
                  href={`/program?etapa=${week}`}
                  aria-current={week === selectedWeek ? "page" : undefined}
                  className={week === selectedWeek ? styles.weekLinkActive : styles.weekLink}
                >
                  {t("week", { week })}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <ScheduleTable games={weekGames} week={selectedWeek} />

      {updatedAt && (
        <p className={styles.updatedAt}>
          {t("updatedAt", { time: formatPublishedAt(updatedAt, locale) })}
        </p>
      )}
    </div>
  );
}
