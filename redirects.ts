import type { NextConfig } from 'next'

type Redirects = NonNullable<NextConfig['redirects']>
type Redirect = Awaited<ReturnType<Redirects>>[number]

/**
 * Permanent redirects from the old WordPress site. Populated during content
 * migration — one entry per old URL. `permanent: true` makes Next emit a 308,
 * not a 301: it preserves the request method, and search engines treat it as
 * equivalent for transferring link equity. Verified 308 in dev.
 *
 * STILL EMPTY of the ~165 old-WordPress URLs (146 posts + 19 pages). That
 * mapping is a launch blocker and has not been started.
 */
export const legacyRedirects: Redirect[] = []

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
