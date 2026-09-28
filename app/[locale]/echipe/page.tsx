import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link, getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { requireLocale } from "@/utils/locale";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/echipe">): Promise<Metadata> {
  const locale = requireLocale((await params).locale);

  const t = await getTranslations({ locale, namespace: "teams" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates("/echipe", [locale])[locale],
      languages: getLanguageAlternates("/echipe"),
    },
  };
}

export default async function TeamsPage({ params }: PageProps<"/[locale]/echipe">) {
  requireLocale((await params).locale);

  const t = await getTranslations("teams");

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>
      <p className={styles.intro}>{t("intro")}</p>
      <p className={styles.intro}>{t("pickPrompt")}</p>
      <Link href="/wiki/the-league/conferinte-si-divizii" className={styles.learnMore}>
        {t("learnMore")}
        <span aria-hidden="true"> ›</span>
      </Link>
    </div>
  );
}
