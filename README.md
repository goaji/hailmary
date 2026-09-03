# hailmary.ro

Romanian-language American football site: NFL news plus evergreen reference content (rules, history, glossary) — built for Romanian readers who already follow the NFL *and* readers who are still learning the sport.

## Stack

- Next.js (App Router), TypeScript (strict)
- Sass + CSS Modules — no Tailwind, no CSS-in-JS
- MDX content in-repo under `content/` (no CMS)
- `next-intl` — `ro` default, `en` for UI + evergreen reference (news stays Romanian-only for now)
- Typed sports-data fetch layer, cached via ISR, refreshed by a cron route

See [AGENTS.md](AGENTS.md) for the full architecture and the non-negotiables behind these choices.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in SPORTS_API_KEY and CRON_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/ro`.

Node version: see `.nvmrc`.

## Testing

```bash
npm run test:unit   # Vitest — pure logic in utils/
npm run test:e2e    # Playwright — behavior, accessibility (axe), visual regression
npm run lint
```

## Project docs

- **[AGENTS.md](AGENTS.md)** — stack, architecture, state management, i18n scope, betting-odds editorial policy, testing conventions
- **[SKILLS.md](SKILLS.md)** — step-by-step recipes for recurring tasks (add an article, add a component, wire a team accent color, write a Playwright test, ...)
- **[DEPLOY.md](DEPLOY.md)** — build & deploy, environment variables, hPanel cron setup, rollback, post-deploy smoke check

## Deployment

Primary target is **Hostinger Business** (Node.js app, builds on push to `main`). A parallel **Vercel** deploy off the same repo serves as the portfolio link and gives per-PR previews. See [DEPLOY.md](DEPLOY.md) for details.
