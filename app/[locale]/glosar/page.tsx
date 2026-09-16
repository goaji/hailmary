import { notFound } from "next/navigation";
import { redirect, routing } from "@/i18n";
import { getGlossaryLetters } from "@/utils/glossary";
import { requireLocale } from "@/utils/locale";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// No content of its own — always redirects to the first letter, e.g. /glosar/b.
export default async function GlossaryIndexPage({ params }: PageProps<"/[locale]/glosar">) {
  const locale = requireLocale((await params).locale);

  const [firstLetter] = getGlossaryLetters(locale);
  if (!firstLetter) {
    notFound();
  }

  redirect({ href: `/glosar/${firstLetter.toLowerCase()}`, locale });
}
