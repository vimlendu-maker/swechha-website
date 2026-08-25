import type { NextConfig } from 'next'
import { designRoutes } from './design-routes'
import { buildLegacyRedirects, readMap } from './lib/legacy-redirects'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/**
 * Permanent redirects from the old WordPress site — 175 of them, GENERATED from
 * `docs/legacy/redirect-map.json`, which is the reviewed map of every URL
 * captured from swechha.in on 2026-08-23 before the domain moved, plus six
 * recovered on 2026-08-26 that the capture never saw.
 *
 * Not a hand-written literal, and not for style: 175 facts maintained in two
 * places drift, and a drifted redirect is invisible until a reader hits a dead
 * URL. `lib/legacy-redirects.ts` does the transformation and refuses to emit
 * anything it cannot verify against this site's own routes — a 308 into a 404
 * looks alive to a crawler and is worse than the 404 it replaces.
 *
 * To change a redirect, edit the map (via `docs/legacy/build-redirect-map.mjs`)
 * and not this file. `docs/legacy/README.md` records the rulings behind it, and
 * the 97 `parent` rows there are a re-point list for when the missing pages
 * get built.
 *
 * The 57 URLs deliberately given NO redirect are absent on purpose: 52 lost
 * 2014-17 press-clipping shells with zero body text, three orphans (a
 * boilerplate draft, a test page, a WordPress sample), the home-to-home loop,
 * and a departed colleague's profile. Absence is the instruction, recorded in
 * the map with a reason rather than left to inference.
 *
 * It was 167 and 59 until 2026-08-25, when /contact-us/ moved from the second
 * list to the first: it was still a live Google result, and a 404 would have
 * forfeited that. See the note on its row in build-redirect-map.mjs.
 *
 * It was 168 and 58 until 2026-08-26, and that revision was a different kind.
 * A backlink audit turned up SIX live pages that the capture never contained:
 * the inventory was built from the old sitemaps, and a WordPress sitemap lists
 * what WordPress still thinks is current, so pages already dropped from it were
 * invisible to the capture and therefore to every ruling made from it. They
 * 404'd because nobody knew they existed, not because anybody decided. Two of
 * the six — /project/yamuna-yatra-2/ and, from the `none` list, the zero-body
 * /we-for-yamuna-and-you/ — were still live Google results while they 404'd.
 *
 * The lesson worth keeping: a complete-looking inventory is only as complete as
 * the sitemap it came from. See `RECOVERED` in build-redirect-map.mjs, which
 * carries each row's Wayback evidence and is counted apart from the capture so
 * the two can never be confused.
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
  /* ★ THE SLUG REDIRECT POINTS AT THE INDEX, NOT AT `/work/campaigns/:slug`,
     AND THAT IS THE FIX RATHER THAN THE COMPROMISE.
     Audited in production 23 August 2026: `/campaigns/delhi-air-quality-2026`
     answered 308 to `/work/campaigns/delhi-air-quality-2026`, which answered
     404. The destination route is `app/work/campaigns/[slug]/page.tsx`, whose
     `generateStaticParams()` reads `getAllCampaigns()` — and `content/campaign/`
     holds nothing but `.gitkeep`, so it generates NO slugs and 404s for every
     one of them. (`/work/campaigns/monsoon-wooding` answers 200 only because it
     is a static built page served by `design-routes.ts`, not by this route.)

     The comment below still says both paths were "verified in dev". They were:
     the REDIRECT fires correctly. What was never verified is that anything is
     on the other end of it. That is the failure mode the file's own header
     paragraph warns about for the legacy list — "a 308 into a 404 looks alive
     to a crawler and is worse than the 404 it replaces" — and it landed here
     because `buildLegacyRedirects()` enforces that rule against this site's
     routes while this hand-written literal is checked by nothing.

     `/work/campaigns` exists, is the umbrella the owner ruled for on 19 August,
     and is where a reader looking for a campaign should arrive. Restoring the
     campaign content file is the other way to fix this, and then the `:slug`
     destination can come back. */
  {
    source: '/campaigns/:slug',
    destination: '/work/campaigns',
    permanent: true,
  },
  {
    source: '/campaigns',
    destination: '/work/campaigns',
    permanent: true,
  },
]
