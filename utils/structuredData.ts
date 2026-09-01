// Pure JSON-LD builders — no fs/i18n/Next imports, so every page.tsx that
// renders structured data can unit-test the shape it produces without a
// browser. Callers resolve locale-aware URLs/strings first and pass plain
// data in.

export type NewsArticleJsonLd = {
  "@context": "https://schema.org";
  "@type": "NewsArticle";
  headline: string;
  datePublished: string;
  author: { "@type": "Person"; name: string };
  image: string[];
  inLanguage: string;
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
};

export function buildNewsArticleJsonLd(input: {
  headline: string;
  datePublished: string;
  authorName: string;
  imageUrl: string;
  url: string;
  inLanguage: string;
}): NewsArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.headline,
    datePublished: input.datePublished,
    author: { "@type": "Person", name: input.authorName },
    image: [input.imageUrl],
    inLanguage: input.inLanguage,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
}

export type BreadcrumbJsonLd = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
};

/** `items` in order from the site root to the current page (root first). */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): BreadcrumbJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type SportsOrganizationJsonLd = {
  "@context": "https://schema.org";
  "@type": "SportsOrganization";
  name: string;
  url: string;
  logo: string;
  sport: "American Football";
  memberOf: { "@type": "SportsOrganization"; name: string };
};

export function buildSportsOrganizationJsonLd(input: {
  name: string;
  url: string;
  logoUrl: string;
  league: string;
}): SportsOrganizationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: input.name,
    url: input.url,
    logo: input.logoUrl,
    sport: "American Football",
    memberOf: { "@type": "SportsOrganization", name: input.league },
  };
}

const BCP47_BY_LOCALE: Record<string, string> = { ro: "ro-RO", en: "en-US" };

/** BCP 47 language tag for `inLanguage` — schema.org wants "ro-RO", not next-intl's bare "ro". */
export function bcp47Locale(locale: string): string {
  return BCP47_BY_LOCALE[locale] ?? locale;
}

/**
 * Serializes a JSON-LD object for a `<script type="application/ld+json">`
 * body. Escapes "<" so a string field (e.g. a headline) can never
 * prematurely close the surrounding `<script>` tag.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
