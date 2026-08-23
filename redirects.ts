import type { NextConfig } from 'next'
import { designRoutes } from './design-routes'
import { buildLegacyRedirects, readMap } from './lib/legacy-redirects'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/**
 * Permanent redirects from the old WordPress site — 167 of them, GENERATED from
 * `docs/legacy/redirect-map.json`, which is the reviewed map of every URL
 * captured from swechha.in on 2026-08-23 before the domain moved.
 *
 * Not a hand-written literal, and not for style: 167 facts maintained in two
 * places drift, and a drifted redirect is invisible until a reader hits a dead
 * URL. `lib/legacy-redirects.ts` does the transformation and refuses to emit
 * anything it cannot verify against this site's own routes — a 308 into a 404
 * looks alive to a crawler and is worse than the 404 it replaces.
 *
 * To change a redirect, edit the map (via `docs/legacy/build-redirect-map.mjs`)
 * and not this file. `docs/legacy/README.md` records the rulings behind it, and
 * the 93 `parent` rows there are a re-point list for when the missing pages
 * get built.
 *
 * The 59 URLs deliberately given NO redirect are absent on purpose: 51 lost
 * 2014-17 press-clipping shells with zero body text, three orphan pages, and a
 * departed colleague's profile. Absence is the instruction, recorded in the map
 * with a reason rather than left to inference.
 */
export const legacyRedirects: Redirect[] = buildLegacyRedirects(
  readMap(),
  new Set(designRoutes().map((r) => r.source)),
)

/**
 * Redirects for URLs this site itself has moved. Kept separate from the
 * WordPress list because these are our own decisions, not migration debt, and
 * they must survive whatever happens to that list.
 *
 * 2026-08-19 — WORK became the umbrella for Projects, Journeys, Campaigns and
 * Events (owner ruling), so campaigns moved from /campaigns to /work/campaigns
 * to match. The old paths shipped and may be linked, so they redirect rather
 * than 404. The slug route is listed first: Next matches in order, and a bare
 * `/campaigns` source would otherwise swallow `/campaigns/anything`.
 *
 * Both verified in dev: /campaigns and /campaigns/delhi-air-quality-2026 each
 * return 308 to their /work/campaigns equivalent.
 */
export const movedRedirects: Redirect[] = [
  {
    source: '/campaigns/:slug',
    destination: '/work/campaigns/:slug',
    permanent: true,
  },
  {
    source: '/campaigns',
    destination: '/work/campaigns',
    permanent: true,
  },
]
