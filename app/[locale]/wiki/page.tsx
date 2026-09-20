import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { Card } from "@/components/ui/Card/Card";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { getAllWikiPages, getWikiStrandTree } from "@/utils/wiki";
import { requireLocale } from "@/utils/locale";
import type { Locale } from "@/types";
import styles from "./page.module.scss";

// An empty hub (zero pages in every strand) would be worse than a 404, so only locales with at least one page get published.
function availableLocales(): Locale[] {
  return routing.locales.filter((locale) => getAllWikiPages(locale).length > 0);
}

export function generateStaticParams() {
  return availableLocales().map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/wiki">): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  if (!availableLocales().includes(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "wikiHub" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates("/wiki", [locale])[locale],
      languages: getLanguageAlternates("/wiki", availableLocales()),
    },
  };
}

export default async function WikiHubPage({ params }: PageProps<"/[locale]/wiki">) {
  const locale = requireLocale((await params).locale);
  if (!availableLocales().includes(locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "wikiHub" });
  const tStrands = await getTranslations({ locale, namespace: "wikiStrands" });
  const tree = getWikiStrandTree(locale).filter((group) => group.pages.length > 0);

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{t("title")}</SectionHeading>
      <p className={styles.intro}>{t("intro")}</p>

      <div className={styles.grid}>
        {tree.map((group) => (
          <Card key={group.strand}>
            <SectionHeading as="h2">{tStrands(`${group.strand}.name`)}</SectionHeading>
            <p className={styles.strandDescription}>{tStrands(`${group.strand}.description`)}</p>
            <LinkList
              variant="link"
              items={group.pages.map((page) => ({
                label: page.frontmatter.title,
                href: `/wiki/${group.strand}/${page.slug}`,
              }))}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
