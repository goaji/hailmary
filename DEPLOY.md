# Deploying hailmary.ro

## Build & start

```bash
npm ci
npm run build
npm run start
```

- Node: see `.nvmrc` (>=22). Confirm the exact version is selectable in hPanel's Node.js app settings.
- `npm run build` must run with the target environment's env vars already set — `SITE_URL` in particular is baked into static output (sitemap, robots.txt, OG images, metadataBase) at build time, not read at request time. Setting it only before `npm run start` has no effect.
- No `output` override is set in `next.config.ts` — this is a standard Node.js server app (`next start`), not a static export.

## Environment variables

Set in hPanel (production) or `.env.local` (dev). Never commit real values — see `.env.example`.

| Variable | Required | Notes |
|---|---|---|
| `SPORTS_API_KEY` | yes | balldontlie NFL API key |
| `CRON_SECRET` | yes | Shared secret the cron job sends as the `X-Cron-Secret` header |
| `SITE_URL` | Hostinger: no · Vercel previews: yes | Defaults to `https://hailmary.ro`. Vercel preview deploys must set this to the actual preview URL or canonicals/sitemap/OG images will silently point at production |

## hPanel cron

- **URL:** `https://hailmary.ro/api/cron/sync-scores`
- **Method:** GET
- **Header:** `X-Cron-Secret: <value matching CRON_SECRET>`
- **Suggested interval:** every 1 minute. The route itself enforces a 30-second minimum between real syncs (`MIN_SYNC_INTERVAL_MS`) and is idempotent/safe under overlapping calls, so a tighter interval than that is wasted, not harmful.
- **Verify a real sync landed** (not just a 200):

```bash
curl -s https://hailmary.ro/api/cron/sync-scores -H "X-Cron-Secret: <secret>" -i
# then confirm updatedAt actually moved:
curl -s https://hailmary.ro/api/scores | jq .updatedAt
```

- **Unauthenticated calls must 401:**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://hailmary.ro/api/cron/sync-scores
```

## Rollback

Git-level revert, host-agnostic — works the same whether the last deploy came from a push to `main` or a manual redeploy:

```bash
git log --oneline -5              # find the last good commit
git revert <bad-commit>..HEAD     # or: git reset --hard <good-commit> && git push --force-with-lease
git push origin main              # triggers a fresh Hostinger build
```

Prefer `revert` over `reset --hard` + force-push unless you're certain nobody else has pulled the bad commits. Also check hPanel's own deployment history — if it keeps prior build artifacts, redeploying a previous build may be faster than a fresh rebuild.

## Post-deploy smoke check

```bash
npm run test:smoke                                          # against https://hailmary.ro
SMOKE_BASE_URL=https://preview-url.vercel.app npm run test:smoke  # against a different deploy
```

Or manually: homepage renders, an article renders, `/en` resolves, `/sitemap.xml` returns 200, the cron route 401s unauthenticated.
