import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { TimelineEntry } from "@/components/reference/TimelineEntry/TimelineEntry";
import { ReferenceLinks } from "@/components/reference/ReferenceLinks/ReferenceLinks";
import { articleComponents } from "@/components/articles/ArticleBody/articleComponents";
import { getReferenceLocales, getReferencePage, groupEntriesByEra } from "@/utils/reference";
import styles from "./page.module.scss";

const SLUG = "istorie";

export function generateStaticParams() {
  return getReferenceLocales(SLUG).map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/istorie">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const page = getReferencePage(SLUG, locale);
  if (!page) {
    notFound();
  }

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    alternates: {
      canonical: getLanguageAlternates(`/${SLUG}`, [locale])[locale],
      languages: getLanguageAlternates(`/${SLUG}`, getReferenceLocales(SLUG)),
    },
  };
}

export default async function HistoryPage({
  params,
}: PageProps<"/[locale]/istorie">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const page = getReferencePage(SLUG, locale);
  if (!page || !page.frontmatter.entries) {
    notFound();
  }

  const eras = groupEntriesByEra(page.frontmatter.entries, page.sections);
  const EraHeading = articleComponents.h2;
  const tNav = await getTranslations("nav");
  const rulesPage = getReferencePage("regulament", locale);

  const crossLinks = [
    rulesPage ? { label: rulesPage.frontmatter.title, href: "/regulament" } : null,
    { label: tNav("glossary"), href: "/glosar" },
  ].filter((item) => item !== null);

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{page.frontmatter.title}</SectionHeading>

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

      {eras.map(({ section, entries, startOrdinal }) =>
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

      <ReferenceLinks items={crossLinks} />
    </div>
  );
}
