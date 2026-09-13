import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { RuleSection } from "@/components/reference/RuleSection/RuleSection";
import { ReferenceLinks } from "@/components/reference/ReferenceLinks/ReferenceLinks";
import { TimelineEntry } from "@/components/reference/TimelineEntry/TimelineEntry";
import { articleComponents } from "@/components/articles/ArticleBody/articleComponents";
import { WikiBreadcrumbs } from "@/components/wiki/WikiBreadcrumbs/WikiBreadcrumbs";
import { WikiRail } from "@/components/wiki/WikiRail/WikiRail";
import { WikiPrevNext } from "@/components/wiki/WikiPrevNext/WikiPrevNext";
import { groupEntriesByEra, splitSectionContent } from "@/utils/reference";
import {
  getAllWikiPages,
  getWikiPage,
  getWikiPageLocales,
  getWikiPrevNext,
  getWikiStrandTree,
  isWikiStrandId,
} from "@/utils/wiki";
import styles from "./page.module.scss";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllWikiPages(locale).map((page) => ({
      locale,
      strand: page.frontmatter.strand,
      slug: page.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/wiki/[strand]/[slug]">): Promise<Metadata> {
  const { locale, strand, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isWikiStrandId(strand)) {
    notFound();
  }

  const page = getWikiPage(strand, slug, locale);
  if (!page) {
    notFound();
  }

  const path = `/wiki/${strand}/${slug}`;

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    alternates: {
      canonical: getLanguageAlternates(path, [locale])[locale],
      languages: getLanguageAlternates(path, getWikiPageLocales(strand, slug)),
    },
  };
}

export default async function WikiCategoryPage({
  params,
}: PageProps<"/[locale]/wiki/[strand]/[slug]">) {
  const { locale, strand, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isWikiStrandId(strand)) {
    notFound();
  }

  const page = getWikiPage(strand, slug, locale);
  if (!page) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const strandTree = getWikiStrandTree(locale);
  const prevNext = getWikiPrevNext(strand, slug, locale);

  const crossLinks = [{ label: tNav("glossary"), href: "/glosar" }];

  const EraHeading = articleComponents.h2;

  return (
    <div className={styles.page}>
      <WikiBreadcrumbs strand={strand} pageTitle={page.frontmatter.title} locale={locale} />
      <SectionHeading as="h1">{page.frontmatter.title}</SectionHeading>

      <div className={styles.layout}>
        <WikiRail
          tree={strandTree}
          currentStrand={strand}
          currentSlug={slug}
          currentPageSections={page.sections}
          locale={locale}
        />

        <div className={styles.content}>
          {page.frontmatter.entries ? (
            <>
              <div className={styles.intro}>
                <MDXRemote
                  source={page.content}
                  components={articleComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [rehypeUnwrapImages],
                    },
                  }}
                />
              </div>

              {groupEntriesByEra(page.frontmatter.entries, page.sections).map(({ section, entries, startOrdinal }) =>
                entries.length > 0 ? (
                  <section key={section.id} className={styles.era} aria-labelledby={section.id}>
                    <EraHeading id={section.id}>{section.title}</EraHeading>
                    <ol className={styles.list} start={startOrdinal}>
                      {entries.map((entry) => (
                        <TimelineEntry key={`${entry.era}-${entry.year}-${entry.title}`} entry={entry} />
                      ))}
                    </ol>
                  </section>
                ) : null,
              )}
            </>
          ) : (
            splitSectionContent(page.content, page.sections).map((section) => (
              <RuleSection key={section.id} section={section} body={section.body} />
            ))
          )}

          <WikiPrevNext prevNext={prevNext} locale={locale} />
          <ReferenceLinks items={crossLinks} />
        </div>
      </div>
    </div>
  );
}
