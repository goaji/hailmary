# SKILLS.md — recurring tasks on hailmary.ro

Step-by-step recipes for the things this project asks for repeatedly. Follow the recipe rather than improvising — consistency across components is the point.

---

## Add a new article

1. Create `content/articles/ro/<slug>.mdx`. Slug is lowercase, hyphenated, Romanian, no diacritics (`mahomes-record-sezon`) — and shared across locales, so an English twin reuses the same slug.
2. Frontmatter — all fields required except `teams` and `featured`:
   ```yaml
   ---
   title: "Mahomes stabilește un nou record de sezon"
   excerpt: "Două paragrafe de context care apar în grid și în meta description."
   coverImage: "/images/articles/mahomes-record.jpg"
   publishedAt: "2026-08-24"
   category: "stiri"
   teams: ["kc"]
   tags: ["analiza", "playoffs"]
   featured: false
   ---
   ```
3. Write the body in MDX. Jargon gets a short parenthetical gloss on first use in any article tagged for beginners.
4. Tag it three ways: `category` for content type, `teams` for who it's about, `tags` for what it's about. `tags` is a controlled vocabulary in `lib/tags.ts` — add a new one there first if none fits, and only if at least two articles will use it. Never invent a tag inline; free-form tags fragment into near-duplicates and leave tag pages with one article on them. The first tag in the array renders as the card chip, so order it deliberately.
5. Only one article may have `featured: true` — it fills the homepage hero. Unset the previous one in the same commit.
6. `generateStaticParams` picks the file up on the next build; ISR surfaces it without a redeploy.
7. News is Romanian-only in v1 — don't create an `en/` twin for `category: "stiri"`. English readers get the Romanian article with a fallback notice.

## Add a new component

1. `components/<group>/<Name>/` containing `<Name>.tsx` and `<Name>.module.scss`.
2. Server Component unless it needs state, effects, or event handlers — then `'use client'` on line one with a one-line comment saying why.
3. No literal UI text in the JSX. Add the key to `messages/ro.json` *and* `messages/en.json`, read it with `useTranslations` (client) or `getTranslations` (server).
4. Props interface named `<Name>Props`, declared above the component, exported only if another module needs it.
5. SCSS: one root block class matching the component name in camelCase (`.newsCard`), children nested one level. Colors from `_variables.scss` or `var(--accent-1)` — never a literal hex.
6. Named export. Barrel files are not used; import from the full path.

## Add a new route

1. `app/[locale]/<segment>/page.tsx` — never outside the locale segment. Keep it thin: fetch data via `lib/`, compose components, return.
2. Export `generateMetadata` (not a static `metadata`) so `title`/`description` come from the locale's messages, plus `openGraph.images` and `alternates.languages` for `hreflang`.
3. `generateStaticParams` returns the cross product of locales × dynamic params.
4. Add the route to `SiteHeader` nav only if it's a top-level destination; otherwise link contextually. Links use the locale-aware `Link`.
5. Handle the empty and not-found cases — `notFound()` for missing content, a translated empty-state message for zero results.

## Wire up a team accent color

1. Team colors live in `lib/teams.ts` as `accent1` / `accent2` hex per team — the single source of truth.
2. `TeamColorProvider` reads the selected team from context (persisted to `localStorage`) and sets `--accent-1` / `--accent-2` as inline custom properties on its wrapper element.
3. Components consume `var(--accent-1)` in SCSS. Never import team data into a presentational component just to read a color.
4. Before adding a team, check both accents for contrast against `#0d0e12` and `#14151a`. If a color fails, store a lightened `accent1` for UI use and keep the true brand color for badges only.

## Consume live score data

1. All sports-API access is inside `lib/scores.ts` — components never call the API.
2. Fetch, then normalize into the `Game` type immediately. Nothing raw from the API crosses into app code.
3. Cache with ISR (`export const revalidate = 60` on live pages, longer elsewhere). Never fetch third-party data per-request.
4. `/api/cron/sync-scores` is the refresh path: it calls the API, writes normalized `Game` records to the cache store, and is invoked by a Vercel cron.
5. Handle all three statuses (`scheduled` / `live` / `final`) plus a stale-data case in every score UI. A game with no score yet is normal, not an error.

## Translate a page or component

1. Add the keys to **both** `messages/ro.json` and `messages/en.json` in the same commit. A key present in one file and not the other is a build failure, not a fallback.
2. Namespace keys by component (`newsCard.readMore`), not by page — components get reused across routes.
3. Interpolation and plurals use ICU message syntax, never string concatenation in the component.
4. For evergreen content pages, add `content/articles/en/<slug>.mdx` with the same slug and frontmatter shape; the `title`/`excerpt` inside it are the translated ones.
5. Check the layout in both locales — English runs 15-25% shorter than Romanian, so nav and buttons that fit in English may wrap in Romanian. Romanian is the constraint; design to it.
6. Never machine-translate football content. The jargon conventions differ between the locales (Romanian keeps English jargon; English prose obviously doesn't need glosses).

## Add a glossary entry

1. Create `content/glossary/ro/<slug>.mdx`. Slug is the canonical term id used by `TermLink` — lowercase, hyphenated, no diacritics (`play-action`, `primul-down`).
2. Frontmatter: `term` (display name), `short` (exactly one sentence — used in the glossary list and the desktop hover tooltip), optional `relatedTerms` (other entry slugs) and `seeAlso` (a route like `/regulament#pase`).
3. The file body is the extended explanation shown in the panel. Two to four short paragraphs; assume the reader has just hit the word mid-article and wants to get back to it. A diagram or example beats a longer definition.
4. Glossary is evergreen content, so add the English twin at `content/glossary/en/<slug>.mdx` with the same slug.
5. Never restate a definition anywhere else — the `/glosar` page, the panel, and the tooltip all read this one file.

## Reference a term in an article

1. Wrap the word in body MDX: `<TermLink term="play-action">play action</TermLink>`. The child text renders inline and can be inflected to fit the sentence; `term` stays the canonical slug.
2. `TermLink` is in the MDX component map — no import per article.
3. Tag a term on **first meaningful use only**. Tagging every occurrence turns the article into a minefield of links and is the fastest way to make this feature feel cheap.
4. If the slug doesn't exist the build fails. That's intentional — write the glossary entry first, or don't tag the word.
5. Jargon a beginner would stumble on gets tagged; jargon that is the subject of the article gets explained in the prose instead.
6. Betting terms (`spread`, `favorit`, `underdog`, `linie`, `over-under`) follow the same first-use rule and are the highest-value tags on the site — a Romanian newcomer reading "favoriți cu 4.5 puncte" has no way to decode it. See the odds policy in AGENT.md for what may and may not appear in the prose itself.

## Write a Playwright test

1. One spec per feature under `e2e/`, named for the behaviour (`explainer-panel.spec.ts`), not the component.
2. Locate by role and accessible name: `getByRole('button', { name: 'Ascunde' })`. If you can't find the element that way, fix the markup rather than falling back to `data-testid` or a CSS selector.
3. Assert what the user gets — panel content, focus position, URL, persisted state after reload — not internal state. The one sanctioned implementation assertion is the `--accent-1` custom property, which is the real contract of `TeamColorProvider`.
4. Cover the failure and edge paths, not just the happy one: Escape closes, focus returns to the trigger, a second term swaps content in place, `?termen=` deep-links, the no-JS context still reaches `/glosar#slug`.
5. Every new page type gets an `@axe-core/playwright` pass, looped over all six team accents.
6. Add a `toHaveScreenshot()` baseline per accent at 375 / 768 / 1440 for anything with layout worth protecting.
7. Romanian strings in assertions come from `messages/ro.json`, never hardcoded in the spec — otherwise a copy edit breaks the suite for the wrong reason.

## Style responsively

1. Breakpoints come from `_mixins.scss` (`@include mq(tablet)`), never a raw `@media`.
2. Mobile-first: base styles are the narrow layout, mixins add the wider ones.
3. Multi-column layouts (news grid, sidebars) collapse to single column on mobile — sidebars go *below* the main content, and the beginner's guide stays above the schedule.
4. Test the header at narrow widths specifically: logo, nav, team picker, and CTA overlapping was a recurring bug in the mockup.

## Before opening a PR

- `tsc --noEmit` and lint clean, no `any`, no unused exports
- No hardcoded hex outside `_variables.scss` and `lib/teams.ts`
- All new copy in Romanian with correct diacritics, and every string pulled from `messages/`, not inlined
- `ro.json` and `en.json` have identical key sets
- Every interactive element is a real `<button>` / `<a>`, reachable by `getByRole` with an accessible name
- Playwright suite green, including the axe pass across all six team accents
- Viewed in both locales; checked that Romanian's longer strings don't break the layout
- Keyboard-navigable: tab through the new UI and confirm visible focus
- Checked at 375px, 768px, 1440px
- Switched teams in the picker and confirmed the new UI re-skins correctly