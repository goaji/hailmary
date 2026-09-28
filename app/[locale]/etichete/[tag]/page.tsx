import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { ArticleCard } from "@/components/home/ArticleCard/ArticleCard";
import { FallbackNotice } from "@/components/ui/FallbackNotice/FallbackNotice";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import { Panel } from "@/components/ui/Panel/Panel";
import { TagLinks } from "@/components/ui/TagLinks/TagLinks";
import { getAllArticlesWithFallback } from "@/utils/articles";
import { requireLocale } from "@/utils/locale";
import { TAG_IDS } from "@hailmary/shared";
import styles from "./page.module.scss";

type TagPageParams = PageProps<"/[locale]/etichete/[tag]">;

function isTag(value: string): value is (typeof TAG_IDS)[number] {
  return (TAG_IDS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => TAG_IDS.map((tag) => ({ locale, tag })));
}

export async function generateMetadata({ params }: TagPageParams): Promise<Metadata> {
  const { locale: localeParam, tag } = await params;
  const locale = requireLocale(localeParam);
  if (!isTag(tag)) {
    notFound();
  }

  const tTag = await getTranslations({ locale, namespace: "tags" });
  const tNews = await getTranslations({ locale, namespace: "newsIndex" });
  const title = tTag(tag);
  const pathname = `/etichete/${tag}`;

  return {
    title,
    description: tNews("metaDescription"),
    alternates: {
      canonical: getLanguageAlternates(pathname, [locale])[locale],
      languages: getLanguageAlternates(pathname),
    },
  };
}

export default async function TagPage({ params }: TagPageParams) {
  const { locale: localeParam, tag } = await params;
  const locale = requireLocale(localeParam);
  if (!isTag(tag)) {
    notFound();
  }

  const { articles, servedLocale } = getAllArticlesWithFallback(locale);
  const taggedArticles = articles.filter((article) => article.tags?.includes(tag));
  const isFallback = servedLocale !== locale;
  const tTag = await getTranslations({ locale, namespace: "tags" });
  const tNews = await getTranslations({ locale, namespace: "newsIndex" });
  const tSidebar = await getTranslations({ locale, namespace: "sidebar" });
  const tags = [...TAG_IDS];

  return (
    <div className={styles.page}>
      {isFallback ? (
        <FallbackNotice locale={locale}>{tNews("fallbackNotice")}</FallbackNotice>
      ) : null}
      <PageLayout
        heading={<SectionHeading as="h1">{tTag(tag)}</SectionHeading>}
        aside={
          <Sidebar locale={locale}>
            <Panel heading={tSidebar("tags.heading")}>
              <TagLinks tags={tags} currentTag={tag} />
            </Panel>
          </Sidebar>
        }
        asideOnMobile="below"
      >
        <div lang={isFallback ? servedLocale : undefined}>
          {taggedArticles.length > 0 ? (
            <div className={styles.grid}>
              {taggedArticles.map((article, index) => (
                <ArticleCard key={article.slug} article={article} priority={index < 3} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>{tNews("emptyFiltered")}</p>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
