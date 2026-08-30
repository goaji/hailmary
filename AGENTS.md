# AGENT.md — hailmary.ro

Romanian-language American football site: NFL news (~2/3 of content) plus evergreen reference material — rules, history, glossary (~1/3). Audience: Romanian readers who follow the NFL *and* Romanian readers who are still learning the sport. Every page must work for both.

## Stack

- **Next.js 14+ App Router**, TypeScript, strict mode on
- **Sass + CSS Modules** — one `.module.scss` per component, co-located. No Tailwind, no global class names, no inline `style` props except for genuinely dynamic values
- **Content**: MDX files in-repo under `content/articles/`. No CMS in v1
- **i18n**: `next-intl` with locale-prefixed routing (`/ro`, `/en`), `ro` as default. Adopt this on day one — see below
- **Live data**: typed fetch layer over a sports-data API, cached via ISR, refreshed by a cron route
- **Hosting**: Hostinger Business plan (Node.js app, deployed from GitHub with builds on push) at hailmary.ro. Full Next.js runtime — SSR, ISR, API routes and middleware all available, so nothing here is constrained to static export. A parallel Vercel deploy off the same repo serves as the portfolio link and gives per-PR previews.

## Non-negotiables

1. **No Tailwind, no styled-components, no CSS-in-JS.** Styling lives in `.module.scss` files. This is a deliberate choice — the project doubles as an interview portfolio piece and should demonstrate CSS fundamentals.
2. **Team accent colors are CSS custom properties**, never hardcoded hex in component SCSS. `TeamColorProvider` sets `--accent-1` / `--accent-2` on a root wrapper; components read `var(--accent-1)`. This is what makes the "Echipa mea" team-color switcher work without per-component logic. The page background does **not** change with the team — the dark base is the brand, the accent is the personalisation.3. **No hardcoded UI copy.** Every label, button, error, and empty state comes from `messages/ro.json` / `messages/en.json` via `next-intl` — even in v1 where Romanian is the only complete locale. Romanian is the primary voice: diacritics required (Știri, nu Stiri). Football jargon stays in English (touchdown, quarterback, blitz) since that's how Romanian fans actually speak, but explain it on first use in beginner-facing content.
4. **Content access goes through the data layer**, never a direct `fs.readFile` in a component. All reads use `getAllArticles` / `getArticleBySlug` / `getTeam` etc. from `utils/`. This keeps the future CMS swap a one-file change.
5. **Server Components by default.** Add `'use client'` only where interaction demands it (glossary filter, team-color picker, explainer panel, mobile nav).
6. **No global state store.** See below.

## State management

**No Redux, no Zustand, no global store.** Deliberate, and worth stating plainly because an agent will otherwise reach for one. The client state here is: selected team, explainer-panel open state + active term, glossary filter text, mobile nav open. That is two providers and two `useState` calls — a store would wrap three values.

The split to hold to:

- **Server state** (articles, teams, schedule, glossary) — Server Components + ISR. Never mirrored into client state.
- **Shared UI state** (selected team, explainer panel) — React Context, one provider per concern: `TeamColorProvider`, `ExplainerProvider`. Keep them separate; they have nothing to do with each other and merging them re-renders both audiences of consumers.
- **Local UI state** (filter text, nav open) — `useState` in the component that owns it. Do not lift.
- **Live remote data** (scores) — TanStack Query or SWR, not Context and not a store. Polling, staleness, refetch-on-focus, and error/loading states are exactly what those libraries exist for, and hand-rolling them in a reducer is how this codebase would go wrong.

If a future feature genuinely needs cross-cutting client state (user accounts with favourites and read history syncing across devices), revisit — but reach for a data-fetching library first, and only then a store.

## Betting odds — editorial only, no widgets

Betting lines are a real part of how the NFL is discussed and belong in articles as **context**. Live odds widgets, operator links, and anything monetised are **out of scope** — under Romanian law an affiliate (anyone earning revenue from players redirected to an operator) needs an ONJN Class 2 licence, promoting an unlicensed operator carries fines, and the advertising rules are actively being tightened. None of that is worth carrying on a site whose purpose is teaching newcomers the sport.

The line to hold is **information, not inducement**:

- Report the line, never the bookmaker — "favoriți cu 4.5 puncte", not "4.5 la <operator>"
- No links to gambling operators anywhere, editorial or UI
- No tips, picks, or predictions framed as betting advice. Matchup analysis is fine; "value on the under" is not
- Attribute to the market generically ("linia de deschidere", "casele de pariuri") — also just better writing than naming one book
- Odds are context inside a story, never the subject of one
- First mention of a betting term in any article gets a `TermLink` — a Romanian newcomer has no idea what the half-point in 4.5 is for, and that gap is exactly what the explainer panel is for

## Deployment

Primary target is **Hostinger Business** as a Node.js app, connected to the GitHub repo so pushes to `main` build and deploy. Secondary target is **Vercel** off the same repo for previews and the portfolio link. The app must run unmodified on both — no host-specific code paths, and nothing that only exists on Vercel.

The one place they differ is scheduled work. There is no managed cron on Hostinger, so `/api/cron/sync-scores` is triggered by an **hPanel cron job** calling the route over HTTPS. Consequences:

- The route authenticates on a secret header (`CRON_SECRET` in env), and rejects anything else with a 401. It is a public URL — treat it as one.
- It must be idempotent and safe to run concurrently; assume overlapping invocations.
- Keep it well under any request timeout — fetch, normalize, write, return. No long loops.
- Don't use `vercel.json` crons as the source of truth. If a Vercel cron is configured too, both hit the same route, which the idempotency rule above already covers.

Environment variables live in hPanel for production and `.env.local` for dev; the sports API key and `CRON_SECRET` are never committed.

## Out of scope (v1)

Do not build these, and do not add UI that implies them:

- **User accounts.** No login, no "Contul meu", no saved articles or followed teams. The team picker persists to `localStorage`, nothing more.
- **A forum or comments.** Discussion lives in the existing Romanian NFL Discord/Facebook communities; link out at most.
- **Betting odds widgets.** Editorial mentions of lines only — see the odds policy above.
- **A headless CMS.** MDX in-repo, with the data layer written so a CMS could be swapped in later.

If a feature seems to need one of these, stop and ask rather than scaffolding it.

## Design direction — "Night Lights"

Dark stadium-at-night feel. Dark base (`#0d0e12` header, `#14151a` page), off-white text (`#f5f4f2`), muted grey secondary text (`#9a9ba3`), and a team-driven accent pair. Bold condensed display type (Bebas Neue) for headlines and the logo; Work Sans for body and UI. Sharp corners, thin borders, minimal shadow — editorial, not app-like.

Reference mockup: `Homepage.dc.html` in the design project. Match its layout and spacing, not its markup (it's a prototype, not production code).

## Directory layout

```
app/
  [locale]/             # every route lives under the locale segment
    layout.tsx          # imports globals.scss, wraps TeamColorProvider + NextIntlClientProvider
    page.tsx            # homepage
    stiri/[slug]/page.tsx
    echipe/[team]/page.tsx
    ...
components/
  ui/                   # Button, Tag, SectionHeading
  layout/               # SiteHeader, SiteFooter, TeamColorProvider, LocaleSwitcher
  home/ articles/ teams/ reference/ schedule/
  explainer/            # ExplainerProvider, ExplainerPanel, ExplainerContent, TermLink
utils/
  articles.ts           # MDX read + frontmatter parse (locale-aware)
  glossary.ts           # glossary entries, keyed by slug
  teams.ts              # 32-team static data
  scores.ts             # sports API client + normalizers
messages/
  ro.json en.json       # all UI strings
content/
  articles/ro/*.mdx articles/en/*.mdx     # en/ holds reference content only in v1
  glossary/ro/*.mdx glossary/en/*.mdx
styles/
  _variables.scss _mixins.scss globals.scss
types/index.ts
i18n.ts middleware.ts
```

Each component folder: `ComponentName/ComponentName.tsx` + `ComponentName.module.scss`.

## Core types

Defined once in `types/index.ts`, imported everywhere. `ArticleFrontmatter`, `Team`, `Game`, `GlossaryEntry` — see the handoff spec for exact shapes. Don't redeclare inline.

## Conventions

- Named exports for components, default export only for `page.tsx`/`layout.tsx`
- SCSS: nest one level max beyond the block; use `_mixins.scss` breakpoints, never raw media queries
- Dates formatted with `Intl.DateTimeFormat(locale)` — locale from `next-intl`, never hardcoded, never a hand-rolled formatter
- Internal links use `next-intl`'s locale-aware `Link`, never a bare `next/link` with a hand-built `/ro/...` path
- Images via `next/image` with explicit dimensions; placeholder images live in `public/placeholder/`
- Accessibility is not a polish step: visible focus rings, real heading hierarchy, alt text on every image, and contrast checked against *every* team accent at the bar its role demands — `accent1` ≥ 3.0 on the page, `accent2` ≥ 4.5 on the panel. Fix the token in `utils/teams.ts`, never the component and never the surface

## Semantic markup

**Use the real element; don't paint a `role` onto a `div`.** A `<button>` already carries `role="button"`, keyboard activation, focus, and disabled semantics. `<div role="button">` gives you the role and none of the behaviour, and then you hand-roll `tabindex`, Enter/Space handling and focus styling — and get one of them wrong.

The reference mockup is a prototype: its controls are `<div>`s and `<span>`s. **Do not reproduce that.** In the build:

- Team swatches — `<button>` each, inside a `role="radiogroup"` with an accessible group label, `aria-checked` on the selected one
- Nav items — real `<a>` (locale-aware `Link`), never a `<span>` with a click handler
- `TermLink` — a `<button>` in the JS path; the no-JS fallback is an `<a>` to `/glosar#slug`
- Origin strip close — `<button aria-label="Ascunde">`
- Explainer panel — `role="dialog"` with `aria-modal`, labelled by the term heading

Explicit `role` is right only where no element expresses the thing: `dialog`, `alert`, `tablist`/`tab`/`tabpanel`, `radiogroup`. That's the whole list.

The test for whether markup is good enough: if `getByRole(role, { name })` can't find a control, a screen reader user can't either.

## Testing

**Playwright** for end-to-end and accessibility; it is the primary test layer. Unit tests (Vitest) are for pure logic in `utils/` (frontmatter parsing, score normalization, tag validation, fallback contracts like `getTeam`) — don't unit-test components.

**Add the unit test in the same commit as the logic, every time — don't wait to be asked.** Whenever a step introduces or touches a pure function in `utils/`, that step's commit includes its test. This applies retroactively too: if you notice existing pure logic in `utils/` has no coverage, add it then, not "later" or "in the dedicated testing step" — a plan that reserves one step for "write the tests" produces gaps everywhere else in the meantime.

- **Locate by role and accessible name.** `getByRole('button', { name: 'Ascunde' })`, never a CSS class or `data-testid`. Role locators survive refactors and double as an accessibility assertion. Reach for `data-testid` only when there is genuinely no accessible handle, and treat that as a markup smell to fix instead.
- **Assert behaviour, not implementation** — that the panel opened with the right term, not that a state variable flipped. One exception worth making: the team switcher is asserted on the computed `--accent-1` custom property, because that is the actual contract between the provider and every component.
- **`@axe-core/playwright` on each page type**, and loop all six team accents — contrast is the failure mode most likely to slip through, since some NFL colors fail on the dark base.
- **Visual regression** via `toHaveScreenshot()` per accent and per breakpoint (375 / 768 / 1440). Cheap, and it catches the header-crowding class of bug.
- **Test the no-JS path** with a JS-disabled browser context: `TermLink` must still be a working link to the glossary.
- **A smoke suite runs against the live Hostinger deploy** after deploy — homepage renders, an article renders, `/en` resolves, the cron route rejects an unauthenticated call with 401.

CI runs the full suite on every PR. A failing accessibility assertion blocks the merge, same as a failing behaviour test.

## Localization scope (v1)

Bilingual **UI + evergreen reference** (rules, history, glossary); **news stays Romanian-only**. That content is written once and never changes, so it's a bounded translation job — while news in two languages would mean writing everything twice, forever, for a site whose whole point is being a Romanian-language NFL publication.

Consequences to build for:

- `getArticleBySlug(slug, locale)` falls back to `ro` when no translation exists, and returns which locale it actually served
- Any page served as a fallback shows a Romanian-content notice in the reader's language — never a silent language switch
- The locale switcher lands on the **same page** in the other locale, not the homepage; if that page has no translation it goes to the fallback with the notice
- `hreflang` alternates on every page, `x-default` → `ro`
- Sitemap lists both locales; only emit `/en` URLs that actually resolve

## Build order

Scaffold + tokens + **i18n routing** → layout shell → UI primitives → content pipeline → homepage → article pages → **explainer panel** → reference pages → teams → live data → polish → deploy. Get each layer rendering before starting the next.

The explainer panel comes right after article pages because it's the site's differentiator, not a nice-to-have — it's what lets one article serve both a beginner and a fan. Score/odds/social widgets are explicitly *after* it, and after the reference pages it depends on.

Locale routing goes in at scaffold time. Retrofitting `/[locale]/` later means touching every route, every link, and every `generateStaticParams` — the one decision in this plan that is genuinely expensive to defer.
