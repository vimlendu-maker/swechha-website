/**
 * THE REDIRECTS FOR ROUTES THIS SITE RETIRED, DERIVED FROM THE REGISTER RATHER
 * THAN HAND-KEPT.
 *
 * ★ WHY THIS FILE EXISTS. Some of this site's routes are EPHEMERAL BY
 * CONSTRUCTION. `/now/climate-event/<slug>` is whatever the detector currently
 * has above its publication bar, and `/journal/<slug>` is whatever a person has
 * currently approved — so both sets shrink as well as grow, and when one shrank
 * the URL simply stopped existing. Measured 2026-09-21: 22 routes that had been
 * built, served and indexed were answering a hard 404 with no redirect.
 *
 * That is not a cosmetic loss. Four of them were still in Search Console's
 * top-40 pages for the 28 days to 2026-09-18 WHILE 404ing:
 *
 *     /now/climate-event/tamil-nadu-flood    8 clicks   261 impressions
 *     /now/climate-event/odisha-flood        6 clicks   352 impressions
 *     /now/climate-event/himalaya-flood      2 clicks   210 impressions
 *     /now/climate-event/assam-flood         1 click    258 impressions
 *
 * — 17 clicks and 1,081 impressions per 28 days from the four visible ones
 * alone, with 18 more below the reporting cutoff. And `/now` is 54% of this
 * site's impressions, so the exposure grows every time an event closes:
 * `/now/climate-event/bihar-flood` is 28 clicks and 3,505 impressions today and
 * will retire the same way.
 *
 * ★ THE LIST IS A DIFF, NOT A LIST. `data/seo/lastmod.json` is keyed by every
 * route this site has ever built — the build writes it, nobody edits it, and it
 * keeps a route's row after the route goes. `designRoutes()` is what is served
 * now. The retired set is the first minus the second, which means retiring an
 * event needs no edit here, and a redirect cannot be forgotten on the day it
 * starts mattering. That is the same posture as `lib/legacy-redirects.ts`: the
 * WordPress list is generated from a reviewed map rather than typed, for the
 * reason its header gives — facts maintained in two places drift, and the drift
 * is invisible until a reader hits a dead URL.
 *
 * ★ THE DESTINATION IS THE NEAREST LIVE ANCESTOR, AND IT IS COMPUTED. A retired
 * event goes to `/now/climate-event`, a retired article to `/journal`, because
 * walking a path up until a segment is a real route is the only rule that
 * stays true when a new ephemeral section is added. A slug-to-slug guess would
 * be worse than nothing: the reader wants the thing that replaced it, and what
 * replaced a closed flood is the index of floods.
 *
 * ★ IT REFUSES RATHER THAN EMITTING SOMETHING SUBTLY WRONG, and the rule it
 * enforces is `lib/legacy-redirects.ts`'s own: "a 308 to a route that does not
 * exist launders a dead end into a live-looking one, which is worse than the
 * 404 it replaces." A retired route with no live ancestor gets no redirect and
 * is reported, not quietly dropped.
 *
 * ★ WHAT IS DELIBERATELY NOT HERE. `/search` is in the register and NOT in the
 * sitemap — it carries `robots: noindex, follow` on purpose. Deriving the
 * retired set from the sitemap instead of from `designRoutes()` would therefore
 * have redirected a live page into its own parent and made the site's own
 * search unreachable. The register is the wrong side of that comparison and the
 * route map is the right one; this note exists because the sitemap is the more
 * obvious choice and it is the wrong one.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NextConfig } from 'next'

type Redirects = NonNullable<NextConfig['redirects']>
export type Redirect = Awaited<ReturnType<Redirects>>[number]

/* `process.cwd()`, not `__dirname`: this module is bundled by both next.config
   and vitest, and a bundled module's `__dirname` is not the project root. Next
   and vitest both run from the root. Same reasoning as legacy-redirects.ts. */
const ROOT = process.cwd()

/** Every route the register has ever held, served or retired. */
export function readBuiltRoutes(): string[] {
  const raw = readFileSync(join(ROOT, 'data/seo/lastmod.json'), 'utf8')
  return Object.keys(JSON.parse(raw) as Record<string, unknown>)
}

/** Every ancestor of `path`, nearest first: `/a/b/c` -> `/a/b`, `/a`. */
export function ancestors(path: string): string[] {
  const parts = path.split('/').filter(Boolean)
  const out: string[] = []
  for (let i = parts.length - 1; i > 0; i--) out.push(`/${parts.slice(0, i).join('/')}`)
  return out
}

export type RetiredProblem = { route: string; why: string }

/**
 * Build the retired-route redirects.
 *
 * `builtRoutes` is every route the register has ever held; `siteRoutes` is what
 * `designRoutes()` serves now. Both are passed in rather than imported so the
 * test can exercise the gates without a built tree — the same reason
 * `buildLegacyRedirects` takes its routes as an argument.
 */
export function buildRetiredRedirects(
  builtRoutes: Iterable<string>,
  siteRoutes: Set<string>,
): { redirects: Redirect[]; problems: RetiredProblem[] } {
  const redirects: Redirect[] = []
  const problems: RetiredProblem[] = []

  for (const route of [...builtRoutes].sort()) {
    if (siteRoutes.has(route)) continue // still served; nothing to do
    if (route === '/') {
      /* The home route cannot retire, and a redirect from `/` would be a loop
         rather than a repair. If the register ever loses it, that is a build
         fault to surface, not a redirect to emit. */
      problems.push({ route, why: 'the home route is missing from the route map' })
      continue
    }

    const parent = ancestors(route).find((a) => siteRoutes.has(a))
    if (!parent) {
      problems.push({ route, why: 'no ancestor of this retired route is a live route' })
      continue
    }

    /* `permanent: true` emits a 308, matching the legacy list: it preserves the
       request method and search engines treat it as equivalent to a 301 for
       transferring link equity. */
    redirects.push({ source: route, destination: parent, permanent: true })
  }

  return { redirects, problems }
}
