import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLanguageAlternates, routing } from "@/i18n";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { RuleToc } from "@/components/reference/RuleToc/RuleToc";
import { RuleSection } from "@/components/reference/RuleSection/RuleSection";
import { getReferenceLocales, getReferencePage, splitSectionContent } from "@/utils/reference";
import styles from "./page.module.scss";

const SLUG = "regulament";

export function generateStaticParams() {
  return getReferenceLocales(SLUG).map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/regulament">): Promise<Metadata> {
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

export default async function RulesPage({
  params,
}: PageProps<"/[locale]/regulament">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const page = getReferencePage(SLUG, locale);
  if (!page) {
    notFound();
  }

  const t = await getTranslations("rulesPage");
  const sections = splitSectionContent(page.content, page.sections);

  return (
    <div className={styles.page}>
      <SectionHeading as="h1">{page.frontmatter.title}</SectionHeading>

      <div className={styles.layout}>
        <RuleToc sections={page.sections} label={t("tocLabel")} />

        <div className={styles.content}>
          {sections.map((section) => (
            <RuleSection key={section.id} section={section} body={section.body} />
          ))}
        </div>
      </div>
    </div>
  );
}
