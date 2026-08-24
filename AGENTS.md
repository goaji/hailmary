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
2. **Team accent colors are CSS custom properties**, never hardcoded hex in component SCSS. `TeamColorProvider` sets `--accent-1` / `--accent-2` on a root wrapper; components read `var(--accent-1)`. This is what makes the "Echipa mea" team-color switcher work without per-component logic.3. **No hardcoded UI copy.** Every label, button, error, and empty state comes from `messages/ro.json` / `messages/en.json` via `next-intl` — even in v1 where Romanian is the only complete locale. Romanian is the primary voice: diacritics required (Știri, nu Stiri). Football jargon stays in English (touchdown, quarterback, blitz) since that's how Romanian fans actually speak, but terms in the glosary will be explained via a pop-up on hover (short explanation) or via a side-panel on click (long explanation). 
4. **Content access goes through the data layer**, never a direct `fs.readFile` in a component. All reads use `getAllArticles` / `getArticleBySlug` / `getTeam` etc. from `lib/`. This keeps the future CMS swap a one-file change.
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
lib/
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
- Accessibility is not a polish step: visible focus rings, real heading hierarchy, alt text on every image, and contrast checked against *every* team accent (some NFL colors fail on dark backgrounds — adjust the token, not the component)

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
