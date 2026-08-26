/* RELATIVE, NOT THE `@/` ALIAS, and that is load-bearing. `next.config.ts`
   imports this module, and Next transpiles the config plus its imports into
   `next.config.compiled.js` at the repo root — a context where the `@/*`
   tsconfig path does not apply. With `@/data/analytics.json` the build fails
   with `Cannot find module './data/analytics.json'`. A relative specifier
   resolves identically under Vitest, Next's bundler and the compiled config. */
import config from '../data/analytics.json'

/**
 * ONE SOURCE FOR THE TRACKER, read by three consumers that cannot import each
 * other: this module (TypeScript — `next.config.ts` and `app/layout.tsx`) and
 * `scripts/lib/situation-shell.mjs` (Node ESM, which cannot import a `.ts`
 * file). They agree because they read the same JSON, and `verify-seo.mjs`
 * asserts the emitted tag matches on every built page, so the two cannot drift
 * silently.
 *
 * THE WEBSITE ID IS COMMITTED RATHER THAN READ FROM `process.env`, on purpose.
 * `.github/workflows/generated-current.yml` regenerates all 35 pages and fails
 * if the working tree moves; an env var absent in CI would change the emitted
 * HTML and fail a gate it did not break. The id is public in the page source of
 * every page regardless, so it is not a secret. The things that ARE secret —
 * the Neon connection string and Umami's `APP_SECRET` — live only in Vercel's
 * environment on the analytics project and appear nowhere in this repository.
 *
 * WHY THERE ARE `upstream*` PATHS. What the browser requests and what Umami
 * listens on are deliberately allowed to differ:
 *
 *   - The PUBLIC path is chosen to survive ad blockers. Umami's defaults
 *     (`/script.js`, `/api/send`) are matched by keyword blocker lists, and an
 *     undercount from blocking is exactly what disqualified GA4 in spec §2.
 *   - The UPSTREAM path is whatever that Umami build actually serves, which is
 *     not ours to choose and has changed between major versions.
 *
 * Measured against the live v3.3.1 instance on 2026-08-26: `/api/record` is
 * ALREADY a built-in Umami endpoint (session recording — it expects
 * `type: 'record' | 'heatmap'`), so pointing the collector at it produced a
 * 400 on every pageview while looking perfectly configured. `/api/send` is the
 * native collector and accepts the tracker's `type: 'event'` payload. Routing
 * `/api/ledger` → `/api/send` keeps the public name blocker-proof while
 * targeting the endpoint Umami actually guarantees.
 */
export const ANALYTICS = config as {
  host: string
  websiteId: string
  scriptPath: string
  upstreamScriptPath: string
  collectPath: string
  upstreamCollectPath: string
}

/**
 * The exact tag every page must carry.
 *
 * `scriptPath` is `/record` and NOT `/record.js`: Umami v3 uses
 * `TRACKER_SCRIPT_NAME` verbatim rather than appending an extension (v2 did
 * append it, which is the source of a lot of stale advice). Measured against
 * the live instance — `/record` returns 200 `application/javascript`,
 * `/record.js` returns 404.
 */
export function trackerTag(): string {
  return `<script defer src="${ANALYTICS.scriptPath}" data-website-id="${ANALYTICS.websiteId}"></script>`
}

/**
 * Proxies the tracker and the collector through this origin, which is the whole
 * reason `script-src 'self'` and `connect-src 'self'` need no change. Without
 * these two rules the tag 404s and nothing is ever recorded.
 */
export function analyticsRewrites(): { source: string; destination: string }[] {
  return [
    {
      source: ANALYTICS.scriptPath,
      destination: `${ANALYTICS.host}${ANALYTICS.upstreamScriptPath}`,
    },
    {
      source: ANALYTICS.collectPath,
      destination: `${ANALYTICS.host}${ANALYTICS.upstreamCollectPath}`,
    },
  ]
}
